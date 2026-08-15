// Downloads experience images (Pexels/Unsplash) referenced in the Google Sheet
// into public/images/experiences/ at build time, so the deployed site never
// depends on those third-party hosts being fast/available at request time.
//
// Filename hashing here must stay in sync with resolveExperienceImage()
// in src/services/experiences.ts.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import Papa from "papaparse";
import sharp from "sharp";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0wvZlSud-v8_n6IWeI6_qfWgmuViBjkp1-yHP-RJ90VlxhistJE2MuV0k_jc88cUeyOngtBI3ZdWM/pub?gid=1700161859&single=true&output=csv";

const OUTPUT_DIR = path.join(process.cwd(), "public", "images", "experiences");

// Cards only ever display these at a few hundred px wide — asking the
// source for a smaller render (and re-encoding as a safety net below) is
// what keeps this folder from ballooning back to multi-MB originals.
const MAX_WIDTH = 900;

function isCacheableImage(url) {
  return typeof url === "string" && (
    url.includes("images.pexels.com") || url.includes("images.unsplash.com")
  );
}

function localFileNameFor(url) {
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 16);
  return `${hash}.webp`;
}

function downscaledUrl(url) {
  const parsed = new URL(url);
  if (parsed.hostname.includes("images.pexels.com")) {
    parsed.searchParams.set("auto", "compress");
    parsed.searchParams.set("cs", "tinysrgb");
    parsed.searchParams.set("w", String(MAX_WIDTH));
  } else if (parsed.hostname.includes("images.unsplash.com")) {
    parsed.searchParams.set("w", String(MAX_WIDTH));
    parsed.searchParams.set("q", "80");
  }
  return parsed.toString();
}

async function main() {
  console.log("[cache-experience-images] fetching sheet...");

  const res = await fetch(SHEET_URL);
  if (!res.ok) throw new Error(`sheet fetch failed: HTTP ${res.status}`);
  const csv = await res.text();

  const { data: rows } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  // "imagen" is the sheet's real (Spanish) column name -- see HEADER_MAP in src/services/sheet.ts
  const urls = [...new Set(rows.map((r) => r.imagen).filter(isCacheableImage))];

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const url of urls) {
    const filePath = path.join(OUTPUT_DIR, localFileNameFor(url));

    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    try {
      const imgRes = await fetch(downscaledUrl(url));
      if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
      const rawBuffer = Buffer.from(await imgRes.arrayBuffer());

      // Safety net in case the source ignored the resize params and
      // returned a full-resolution original anyway. Always re-encode as
      // WebP regardless, since that's the format the site links to.
      const metadata = await sharp(rawBuffer).metadata();
      const pipeline =
        metadata.width && metadata.width > MAX_WIDTH
          ? sharp(rawBuffer).resize({ width: MAX_WIDTH, withoutEnlargement: true })
          : sharp(rawBuffer);
      const buffer = await pipeline.webp({ quality: 85 }).toBuffer();

      fs.writeFileSync(filePath, buffer);
      downloaded++;
    } catch (err) {
      failed++;
      console.warn(`[cache-experience-images] failed to cache ${url}:`, err.message);
    }
  }

  console.log(
    `[cache-experience-images] done — downloaded: ${downloaded}, already cached: ${skipped}, failed: ${failed}`
  );
}

main().catch((err) => {
  // Never block the build over a flaky Sheet/image host — the app falls
  // back to hotlinking for anything that isn't cached locally.
  console.warn("[cache-experience-images] skipped (non-fatal):", err.message);
});
