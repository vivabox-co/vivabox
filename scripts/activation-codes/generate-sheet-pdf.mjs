// Lays out a batch of activation codes (from generate-batch.mjs's CSV) as a
// print-ready PDF sticker sheet: one or more pages, each COLUMNS x ROWS
// codes, one code per cell sized to exactly fill the sheet, bold sans-serif
// sized to the largest legible fit, plus a hairline cut grid between cells.
//
// Usage: node scripts/activation-codes/generate-sheet-pdf.mjs [codes.csv] [output.pdf]
//   [--columns N] [--rows N] [--sheet-width-mm N] [--sheet-height-mm N] [--sheets N]
// (csv/output default to the most recent batch in scripts/activation-codes/output/)
//
// Defaults below reproduce the printer's current constraint: sheets of
// 97x47cm, twice, laid side by side for ~1m² — cells widened from 5cm to
// 97/19 ≈ 5.1cm so each sheet is used edge to edge with no dead margin.
// 19x47 x 2 sheets = 1786 codes printed; any extra codes in the CSV (here,
// 214 of the 2000 already in Supabase) are simply left unprinted, still
// valid in stock for a future sheet.

import fs from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const OUTPUT_DIR = path.join(process.cwd(), "scripts", "activation-codes", "output");

const CELL_PADDING_X_MM = 2;
const CELL_PADDING_Y_MM = 1;
const CUT_LINE_WIDTH_PT = 0.25; // hairline

const MM_TO_PT = 2.8346456693;
const mm = (value) => value * MM_TO_PT;

function parseArgs(argv) {
  const opts = {
    columns: 19,
    rows: 47,
    sheetWidthMm: 970,
    sheetHeightMm: 470,
    sheets: 2,
    positional: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const flagToKey = {
      "--columns": "columns",
      "--rows": "rows",
      "--sheet-width-mm": "sheetWidthMm",
      "--sheet-height-mm": "sheetHeightMm",
      "--sheets": "sheets",
    };
    const key = flagToKey[argv[i]];
    if (key) opts[key] = Number(argv[++i]);
    else opts.positional.push(argv[i]);
  }
  return opts;
}

function findLatestCsv() {
  const files = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith("-codes.csv"))
    .sort();
  if (files.length === 0) {
    throw new Error(`No *-codes.csv found in ${OUTPUT_DIR} — run generate-batch.mjs first.`);
  }
  return path.join(OUTPUT_DIR, files[files.length - 1]);
}

function readCodes(csvPath) {
  const lines = fs.readFileSync(csvPath, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
  const [header, ...rows] = lines;
  if (header !== "code") throw new Error(`Expected a "code" header in ${csvPath}, got: ${header}`);
  return rows;
}

// Print-only readability split: "VIVA-RHUCYW5W" -> "VIVA-RHUC-YW5W". The
// underlying code (Supabase, CSV, SQL) is untouched — normalizeCode() at
// activation strips every dash anyway, so this only affects what's printed.
function formatForDisplay(code) {
  const [prefix, suffix] = code.split("-");
  const mid = Math.ceil(suffix.length / 2);
  return `${prefix}-${suffix.slice(0, mid)}-${suffix.slice(mid)}`;
}

// Helvetica-Bold isn't monospace, so same-length codes can still render at
// different widths (e.g. "M" vs "I") — size against the widest code in the
// batch, not just any one sample, or narrower cells would overflow.
function fitFontSize(font, texts, maxWidthPt, maxHeightPt) {
  const maxWidthAt1 = Math.max(...texts.map((text) => font.widthOfTextAtSize(text, 1)));
  const heightAt1 = font.heightAtSize(1);
  return Math.min(maxWidthPt / maxWidthAt1, maxHeightPt / heightAt1);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const csvPath = opts.positional[0] ? path.resolve(opts.positional[0]) : findLatestCsv();
  const outPath = opts.positional[1]
    ? path.resolve(opts.positional[1])
    : csvPath.replace(/-codes\.csv$/, "-sheet.pdf");

  const { columns, rows, sheetWidthMm, sheetHeightMm, sheets } = opts;
  const perSheet = columns * rows;
  const cellWidthMm = sheetWidthMm / columns;
  const cellHeightMm = sheetHeightMm / rows;

  const allCodes = readCodes(csvPath);
  const codes = allCodes.slice(0, perSheet * sheets);
  const leftover = allCodes.length - codes.length;
  const displayTexts = codes.map(formatForDisplay);

  const pageWidthPt = mm(sheetWidthMm);
  const pageHeightPt = mm(sheetHeightMm);

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const availableWidthPt = mm(cellWidthMm - 2 * CELL_PADDING_X_MM);
  const availableHeightPt = mm(cellHeightMm - 2 * CELL_PADDING_Y_MM);
  const fontSize = fitFontSize(font, displayTexts, availableWidthPt, availableHeightPt);

  for (let s = 0; s < sheets; s++) {
    const sheetTexts = displayTexts.slice(s * perSheet, (s + 1) * perSheet);
    if (sheetTexts.length === 0) break;

    const page = pdf.addPage([pageWidthPt, pageHeightPt]);
    const sheetRows = Math.ceil(sheetTexts.length / columns);

    // Cut grid: full hairline lines at every column/row boundary, edge to edge.
    for (let c = 0; c <= columns; c++) {
      const x = mm(c * cellWidthMm);
      page.drawLine({
        start: { x, y: 0 },
        end: { x, y: pageHeightPt },
        thickness: CUT_LINE_WIDTH_PT,
        color: rgb(0, 0, 0),
      });
    }
    for (let r = 0; r <= sheetRows; r++) {
      const y = pageHeightPt - mm(r * cellHeightMm);
      page.drawLine({
        start: { x: 0, y },
        end: { x: pageWidthPt, y },
        thickness: CUT_LINE_WIDTH_PT,
        color: rgb(0, 0, 0),
      });
    }

    sheetTexts.forEach((text, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);

      const cellX = mm(col * cellWidthMm);
      // PDF y-axis grows upward; row 0 is the top row of the sheet.
      const cellTopY = pageHeightPt - mm(row * cellHeightMm);

      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      const x = cellX + (mm(cellWidthMm) - textWidth) / 2;
      const y = cellTopY - mm(cellHeightMm) / 2 - textHeight * 0.35; // optical baseline centering

      page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
    });
  }

  fs.writeFileSync(outPath, await pdf.save());
  console.log(`[generate-sheet-pdf] ${codes.length} codes printed across ${sheets} sheet(s) (${columns}x${rows} each), font size ${fontSize.toFixed(1)}pt`);
  console.log(`[generate-sheet-pdf] sheet size: ${(sheetWidthMm / 10).toFixed(1)}cm x ${(sheetHeightMm / 10).toFixed(1)}cm, cell: ${(cellWidthMm / 10).toFixed(2)}cm x ${(cellHeightMm / 10).toFixed(2)}cm`);
  if (leftover > 0) console.log(`[generate-sheet-pdf] ${leftover} codes left unprinted (still valid in stock)`);
  console.log(`[generate-sheet-pdf] PDF: ${outPath}`);
}

main();
