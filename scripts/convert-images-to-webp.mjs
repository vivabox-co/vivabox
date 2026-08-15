// One-off: converts the site's static PNG/JPG source images to WebP to cut
// page weight. Only touches files actually referenced from code (see the
// list below) -- a few unreferenced PNGs sit in public/images/ as leftovers
// and are intentionally left alone. Deletes the original after a successful
// conversion since callers are updated to the new .webp path in the same change.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const FILES = [
  "public/images/app-phone/vivabox-app-experiencias.png",
  "public/images/box-includes/arrow-curv-left.png",
  "public/images/box-includes/arrow-curv-right.png",
  "public/images/box-includes/vivabox-caja-regalo.png",
  "public/images/box-includes/vivabox-catalogo-experiencias.png",
  "public/images/box-includes/vivabox-codigo-activacion.png",
  "public/images/box-includes/vivabox-dedicatoria-personal.png",
  "public/images/empresas/boxes-corporate-grid.png",
  "public/images/final-cta/persona-regalando-vivabox.png",
  "public/images/founders/Franko.png",
  "public/images/founders/Gotie.png",
  "public/images/hero/hero-poster-mobile.jpg",
  "public/images/hero/hero-poster.jpg",
  "public/images/hero/hero.png",
  "public/images/hero/hero2.jpg",
  "public/images/occasions/agradecimiento.jpg",
  "public/images/occasions/aniversario.jpg",
  "public/images/occasions/boda.jpg",
  "public/images/occasions/celebracion.jpg",
  "public/images/occasions/cumpleanos.jpg",
  "public/images/occasions/empresarial.jpg",
  "public/images/occasions/pareja.jpg",
  "public/images/occasions/sorpresa.jpg",
  "public/icons/logo.png",
  "public/icons/logo-white.png",
  "public/icons/vivabox.png",
  "public/icons/vivabox-white.png",
];

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const rel of FILES) {
    const filePath = path.join(process.cwd(), rel);
    if (!fs.existsSync(filePath)) {
      console.warn(`[skip] ${rel} not found`);
      continue;
    }

    const inputBuffer = fs.readFileSync(filePath);
    const before = inputBuffer.length;

    const outPath = filePath.replace(/\.(png|jpe?g)$/i, ".webp");
    const buffer = await sharp(inputBuffer).webp({ quality: 85 }).toBuffer();
    fs.writeFileSync(outPath, buffer);
    fs.unlinkSync(filePath);

    const after = buffer.length;
    totalBefore += before;
    totalAfter += after;

    console.log(
      `[convert] ${rel} -> ${path.relative(process.cwd(), outPath)} ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`
    );
  }

  console.log(
    `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB`
  );
}

main();
