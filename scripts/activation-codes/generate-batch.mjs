// Generates a batch of unique pre-printed activation codes (format VIVA-XXXXXXXX)
// for physical box stickers — the "stock" codes described in the
// activation_codes comment in supabase/schema.sql, inserted with venta_id
// and expires_at NULL, later claimed by App_Operativo when a box sells.
//
// Alphabet/length must stay in sync with src/utils/generateCode.ts and
// src/features/activation/generateActivationCode.ts.
//
// Usage: node scripts/activation-codes/generate-batch.mjs [--count 2000] [--prefix VIVA]
//
// Writes into scripts/activation-codes/output/ (gitignored — these are real,
// usable activation codes and must never be committed):
//   <label>-codes.csv   one code per line, for generate-sheet-pdf.mjs
//   <label>-insert.sql  batched INSERT ... ON CONFLICT DO NOTHING for Supabase

import fs from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // excludes 0/O/1/I
const CODE_LENGTH = 8;
const OUTPUT_DIR = path.join(process.cwd(), "scripts", "activation-codes", "output");

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { count: 2000, prefix: "VIVA" };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--count") opts.count = Number(args[++i]);
    else if (args[i] === "--prefix") opts.prefix = args[++i];
  }
  return opts;
}

function generateCode(prefix) {
  let suffix = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${prefix}-${suffix}`;
}

function normalizeCode(code) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function generateUniqueBatch(count, prefix) {
  const codes = new Set();
  while (codes.size < count) {
    codes.add(generateCode(prefix));
  }
  return [...codes];
}

function sqlEscape(value) {
  return value.replace(/'/g, "''");
}

function writeSql(codes, filePath) {
  const rows = codes
    .map((code) => `  ('${sqlEscape(code)}', '${sqlEscape(normalizeCode(code))}')`)
    .join(",\n");

  const sql = `-- Pre-printed activation code batch — ${codes.length} codes.
-- Run in the Supabase SQL editor against the project's live database.
-- Requires the schema change in supabase/schema.sql (venta_id/expires_at
-- nullable on activation_codes) to already be applied.
insert into activation_codes (code, code_normalized)
values
${rows}
on conflict (code) do nothing;
`;

  fs.writeFileSync(filePath, sql, "utf8");
}

function writeCsv(codes, filePath) {
  const csv = ["code", ...codes].join("\n") + "\n";
  fs.writeFileSync(filePath, csv, "utf8");
}

function main() {
  const { count, prefix } = parseArgs();
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error(`--count must be a positive integer, got: ${count}`);
  }

  const codes = generateUniqueBatch(count, prefix);
  const label = new Date().toISOString().replace(/[:.]/g, "-");

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const csvPath = path.join(OUTPUT_DIR, `${label}-codes.csv`);
  const sqlPath = path.join(OUTPUT_DIR, `${label}-insert.sql`);

  writeCsv(codes, csvPath);
  writeSql(codes, sqlPath);

  console.log(`[generate-batch] ${codes.length} unique codes generated`);
  console.log(`[generate-batch] CSV: ${csvPath}`);
  console.log(`[generate-batch] SQL: ${sqlPath}`);
}

main();
