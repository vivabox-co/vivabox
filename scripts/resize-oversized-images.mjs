// One-off cleanup: several source images in public/images (experience photos
// cached from Pexels/Unsplash, occasion photos, the box product shot) were
// committed at full camera/original resolution (up to 4593x3072, 23MB) while
// only ever being displayed at a few hundred px in cards. Next/Image still
// has to decode the full source on every cache miss, which is what made
// cards feel slow to load on mobile networks. This resizes them in place to
// a sane max width and re-compresses, keeping the original format/extension
// so nothing in the code that references these paths needs to change.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const targets = [
  { dir: "public/images/experiences", maxWidth: 900 },
  { dir: "public/images/occasions", maxWidth: 900 },
  { dir: "public/images/boxes", maxWidth: 700 },
];

const exts = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function processFile(filePath, maxWidth) {
  const inputBuffer = fs.readFileSync(filePath);
  const before = inputBuffer.length;
  const ext = path.extname(filePath).toLowerCase();
  const image = sharp(inputBuffer);
  const meta = await image.metadata();

  if (!meta.width || meta.width <= maxWidth) {
    return { filePath, before, after: before, skipped: true };
  }

  const pipeline = image.resize({ width: maxWidth, withoutEnlargement: true });

  const buffer =
    ext === ".webp"
      ? await pipeline.webp({ quality: 85 }).toBuffer()
      : ext === ".png"
        ? await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
        : await pipeline.jpeg({ quality: 78, mozjpeg: true }).toBuffer();

  fs.writeFileSync(filePath, buffer);
  const after = buffer.length;
  return { filePath, before, after, skipped: false };
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const { dir, maxWidth } of targets) {
    const absDir = path.join(process.cwd(), dir);
    if (!fs.existsSync(absDir)) continue;

    const files = fs
      .readdirSync(absDir)
      .filter((f) => exts.has(path.extname(f).toLowerCase()))
      .map((f) => path.join(absDir, f));

    for (const file of files) {
      const result = await processFile(file, maxWidth);
      totalBefore += result.before;
      totalAfter += result.after;

      const label = result.skipped ? "skip " : "resize";
      console.log(
        `[${label}] ${path.relative(process.cwd(), file)} ${(result.before / 1024).toFixed(0)}KB -> ${(result.after / 1024).toFixed(0)}KB`
      );
    }
  }

  console.log(
    `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`
  );
}

main();
