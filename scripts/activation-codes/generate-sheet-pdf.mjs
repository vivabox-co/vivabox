// Lays out a batch of activation codes (from generate-batch.mjs's CSV) as a
// print-ready PDF sticker sheet: a grid of CELL_WIDTH_MM x CELL_HEIGHT_MM
// cells, COLUMNS wide, one code per cell, bold sans-serif sized to the
// largest legible fit, plus a hairline cut grid between cells.
//
// Usage: node scripts/activation-codes/generate-sheet-pdf.mjs <codes.csv> [output.pdf]
// (paths default to the most recent batch in scripts/activation-codes/output/)

import fs from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const OUTPUT_DIR = path.join(process.cwd(), "scripts", "activation-codes", "output");

const COLUMNS = 20;
const CELL_WIDTH_MM = 50; // 5cm
const CELL_HEIGHT_MM = 10; // 1cm
const CELL_PADDING_X_MM = 2;
const CELL_PADDING_Y_MM = 1;
const CUT_LINE_WIDTH_PT = 0.25; // hairline

const MM_TO_PT = 2.8346456693;
const mm = (value) => value * MM_TO_PT;

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

// Helvetica-Bold isn't monospace, so same-length codes can still render at
// different widths (e.g. "M" vs "I") — size against the widest code in the
// batch, not just any one sample, or narrower cells would overflow.
function fitFontSize(font, codes, maxWidthPt, maxHeightPt) {
  const maxWidthAt1 = Math.max(...codes.map((code) => font.widthOfTextAtSize(code, 1)));
  const heightAt1 = font.heightAtSize(1);
  return Math.min(maxWidthPt / maxWidthAt1, maxHeightPt / heightAt1);
}

async function main() {
  const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : findLatestCsv();
  const outPath = process.argv[3]
    ? path.resolve(process.argv[3])
    : csvPath.replace(/-codes\.csv$/, "-sheet.pdf");

  const codes = readCodes(csvPath);
  const rows = Math.ceil(codes.length / COLUMNS);

  const pageWidthPt = mm(COLUMNS * CELL_WIDTH_MM);
  const pageHeightPt = mm(rows * CELL_HEIGHT_MM);

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([pageWidthPt, pageHeightPt]);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const availableWidthPt = mm(CELL_WIDTH_MM - 2 * CELL_PADDING_X_MM);
  const availableHeightPt = mm(CELL_HEIGHT_MM - 2 * CELL_PADDING_Y_MM);
  const fontSize = fitFontSize(font, codes, availableWidthPt, availableHeightPt);

  // Cut grid: full hairline lines at every column/row boundary, edge to edge.
  for (let c = 0; c <= COLUMNS; c++) {
    const x = mm(c * CELL_WIDTH_MM);
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: pageHeightPt },
      thickness: CUT_LINE_WIDTH_PT,
      color: rgb(0, 0, 0),
    });
  }
  for (let r = 0; r <= rows; r++) {
    const y = mm(r * CELL_HEIGHT_MM);
    page.drawLine({
      start: { x: 0, y },
      end: { x: pageWidthPt, y },
      thickness: CUT_LINE_WIDTH_PT,
      color: rgb(0, 0, 0),
    });
  }

  codes.forEach((code, i) => {
    const col = i % COLUMNS;
    const row = Math.floor(i / COLUMNS);

    const cellX = mm(col * CELL_WIDTH_MM);
    // PDF y-axis grows upward; row 0 is the top row of the sheet.
    const cellTopY = pageHeightPt - mm(row * CELL_HEIGHT_MM);

    const textWidth = font.widthOfTextAtSize(code, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    const x = cellX + (mm(CELL_WIDTH_MM) - textWidth) / 2;
    const y = cellTopY - mm(CELL_HEIGHT_MM) / 2 - textHeight * 0.35; // optical baseline centering

    page.drawText(code, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
  });

  fs.writeFileSync(outPath, await pdf.save());
  console.log(`[generate-sheet-pdf] ${codes.length} codes, ${COLUMNS}x${rows} grid, font size ${fontSize.toFixed(1)}pt`);
  console.log(`[generate-sheet-pdf] sheet: ${(pageWidthPt / MM_TO_PT / 10).toFixed(1)}cm x ${(pageHeightPt / MM_TO_PT / 10).toFixed(1)}cm`);
  console.log(`[generate-sheet-pdf] PDF: ${outPath}`);
}

main();
