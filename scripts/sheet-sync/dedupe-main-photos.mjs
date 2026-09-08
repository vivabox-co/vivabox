// Fixes rows in "Experiencias" whose main photo ("imagen") is identical to
// another row's main photo. Galleries ("imagenes_adicionales") are allowed to
// share photos between rows -- only the cover shot must be unique. Each fix
// below re-picks the main photo from that row's own existing photo set (no
// new photography), moving the old main into the gallery.
//
// Requires scripts/sheet-sync/authorize.mjs to have been run once already.
//
// Usage (dry run, default -- just shows what would change):
//   SHEET_ID=<spreadsheet id from the edit URL> node scripts/sheet-sync/dedupe-main-photos.mjs
//
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/dedupe-main-photos.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"

// codigo_interno -> { expectedImagen, imagen, imagenesAdicionales }
// "expectedImagen" is a sanity check against what's currently in the sheet;
// the write aborts if it doesn't match (sheet changed since this was written).
const FIXES = {
  // Karts indoor (Superkarts) -- Sede Hayuelos duplicated Sede Nuestro Bogota's
  // cover. Same 4-photo set for both; just rotate which one is the cover.
  "AVE-BOG-002": {
    expectedImagen: "/images/experiencias-reales/karts-indoor-bogota-vivabox/karts-indoor-bogota-vivabox-1.webp",
    imagen: "/images/experiencias-reales/karts-indoor-bogota-vivabox/karts-indoor-bogota-vivabox-2.webp",
    imagenesAdicionales: [
      "/images/experiencias-reales/karts-indoor-bogota-vivabox/karts-indoor-bogota-vivabox-1.webp",
      "/images/experiencias-reales/karts-indoor-bogota-vivabox/karts-indoor-bogota-vivabox-3.webp",
      "/images/experiencias-reales/karts-indoor-bogota-vivabox/karts-indoor-bogota-vivabox-4.webp",
    ],
  },
  // Circuito de aventura con canopy (Cabalgatas Bonanza) duplicated Aventura a
  // caballo's cover -- both draw from the same horseback-riding photo shoot
  // (no dedicated canopy photography yet). Give canopy the POV trail shot
  // (photo 2, least literally "horseback portrait") as its cover instead.
  "AVE-COR-003": {
    expectedImagen: "/images/experiencias-reales/cabalgata-montana-la-calera-vivabox/cabalgata-montana-la-calera-vivabox-1.webp",
    imagen: "/images/experiencias-reales/cabalgata-montana-la-calera-vivabox/cabalgata-montana-la-calera-vivabox-2.webp",
    imagenesAdicionales: [
      "/images/experiencias-reales/cabalgata-montana-la-calera-vivabox/cabalgata-montana-la-calera-vivabox-1.webp",
      "/images/experiencias-reales/cabalgata-montana-la-calera-vivabox/cabalgata-montana-la-calera-vivabox-3.webp",
    ],
  },
}

function columnLetter(index) {
  let letter = ""
  let n = index + 1
  while (n > 0) {
    const rem = (n - 1) % 26
    letter = String.fromCharCode(65 + rem) + letter
    n = Math.floor((n - 1) / 26)
  }
  return letter
}

async function main() {
  const spreadsheetId = process.env.SHEET_ID
  if (!spreadsheetId) {
    throw new Error(
      "Falta SHEET_ID (el ID en la URL de edición del sheet, no el link publicado como CSV)."
    )
  }
  const gid = process.env.SHEET_GID || DEFAULT_GID
  const confirm = process.argv.includes("--confirm")

  const sheets = await getSheetsClient()

  const { data: meta } = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.sheets.find((s) => String(s.properties.sheetId) === String(gid))
  if (!sheet) {
    throw new Error(
      `No encontré una pestaña con gid=${gid}. Pestañas disponibles: ` +
      meta.sheets.map((s) => `${s.properties.title} (gid=${s.properties.sheetId})`).join(", ")
    )
  }
  const title = sheet.properties.title

  const { data: row1 } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!1:1`,
  })
  const headers = row1.values?.[0] || []
  const codigoColIndex = headers.indexOf("codigo_interno")
  const imagenColIndex = headers.indexOf("imagen")
  const adicionalesColIndex = headers.indexOf("imagenes_adicionales")
  if (codigoColIndex === -1 || imagenColIndex === -1 || adicionalesColIndex === -1) {
    throw new Error("No encontré columna 'codigo_interno', 'imagen' o 'imagenes_adicionales' en la fila 1.")
  }
  const codigoCol = columnLetter(codigoColIndex)
  const imagenCol = columnLetter(imagenColIndex)
  const adicionalesCol = columnLetter(adicionalesColIndex)

  const { data: codigoData } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!${codigoCol}2:${codigoCol}10000`,
  })
  const codigoValues = codigoData.values || []

  const rowFor = {}
  codigoValues.forEach((r, i) => {
    const code = (r[0] || "").trim()
    if (FIXES[code]) rowFor[code] = i + 2 // 1-indexed + header
  })

  const missing = Object.keys(FIXES).filter((code) => !rowFor[code])
  if (missing.length) {
    throw new Error(`No encontré fila para: ${missing.join(", ")}`)
  }

  // Sanity-check current "imagen" value before touching anything.
  const rows = Object.keys(FIXES).map((code) => rowFor[code]).sort((a, b) => a - b)
  const { data: currentImagenData } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!${imagenCol}${rows[0]}:${imagenCol}${rows[rows.length - 1]}`,
  })
  const currentImagenValues = currentImagenData.values || []

  const mismatches = []
  for (const [code, fix] of Object.entries(FIXES)) {
    const row = rowFor[code]
    const actual = (currentImagenValues[row - rows[0]]?.[0] || "").trim()
    if (actual !== fix.expectedImagen) mismatches.push({ code, row, expected: fix.expectedImagen, actual })
  }
  if (mismatches.length) {
    console.error("El sheet cambió desde que se armó este mapeo -- abortando. Discrepancias:")
    mismatches.forEach((m) => console.error(`  ${m.code} (fila ${m.row}): esperaba "${m.expected}", encontré "${m.actual}"`))
    process.exit(1)
  }

  console.log(`Pestaña "${title}". ${Object.keys(FIXES).length} filas a corregir:\n`)
  for (const [code, fix] of Object.entries(FIXES)) {
    const row = rowFor[code]
    console.log(`  ${code} (fila ${row}):`)
    console.log(`    imagen: ${fix.expectedImagen} -> ${fix.imagen}`)
    console.log(`    imagenes_adicionales: -> ${fix.imagenesAdicionales.join("|")}`)
  }

  if (!confirm) {
    console.log("\nDry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  const data = []
  for (const [code, fix] of Object.entries(FIXES)) {
    const row = rowFor[code]
    data.push({ range: `'${title}'!${imagenCol}${row}`, values: [[fix.imagen]] })
    data.push({ range: `'${title}'!${adicionalesCol}${row}`, values: [[fix.imagenesAdicionales.join("|")]] })
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "RAW", data },
  })

  console.log("\nListo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
