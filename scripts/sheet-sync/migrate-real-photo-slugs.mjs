// Rewrites the "imagen" and "imagenes_adicionales" columns for the
// codigo_interno rows below from their old codigo_interno-based photo paths
// to the descriptive slugs the files were renamed to on disk (see
// public/images/experiencias-reales/ and REAL_PHOTO_SLUGS in
// src/services/experiences.ts, which this migration makes redundant).
//
// AVE-COR-004 has no photos of its own -- it currently borrows AVE-COR-003's
// -- so it's migrated to the same new slug to keep that (pre-existing)
// borrowed reference working.
//
// Requires scripts/sheet-sync/authorize.mjs to have been run once already.
//
// Usage (dry run, default -- just shows what would change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/migrate-real-photo-slugs.mjs
//
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/migrate-real-photo-slugs.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"

// codigo_interno -> [slug, photoCount]
const MIGRATIONS = {
  "AVE-CNO-001": ["motocross-tocancipa-vivabox", 3],
  "AVE-CNO-002": ["escalada-rocas-suesca-vivabox", 3],
  "AVE-COR-001": ["caminata-laguna-ubaque-vivabox", 3],
  "AVE-COR-002": ["cabalgata-parrillada-la-calera-vivabox", 3],
  "AVE-COR-003": ["cabalgata-montana-la-calera-vivabox", 3],
  "AVE-COR-004": ["cabalgata-montana-la-calera-vivabox", 3], // borrows AVE-COR-003's photos, same as before
  "BIE-BOG-001": ["flotacion-tanque-sensorial-bogota-vivabox", 3],
  "EST-CNO-001": ["domo-glamping-suesca-vivabox", 3],
  "EST-COR-001": ["refugio-montana-choachi-vivabox", 3],
  "EST-COR-002": ["cabana-montana-choachi-vivabox", 3],
  "GAS-BOG-001": ["cena-carnes-bogota-vivabox", 3],
  "GAS-BOG-002": ["cena-colombiana-bogota-vivabox", 3],
  "GAS-BOG-003": ["taller-cata-cacao-bogota-vivabox", 3],
  "GAS-BOG-004": ["brunch-bogota-vivabox", 2],
  "GAS-BOG-005": ["pasteles-cafe-bogota-vivabox", 2],
  "GAS-CNO-001": ["taller-sushi-pacho-vivabox", 3],
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

function newValues(slug, count) {
  const paths = Array.from(
    { length: count },
    (_, i) => `/images/experiencias-reales/${slug}/${slug}-${i + 1}.webp`
  )
  return { imagen: paths[0], imagenesAdicionales: paths.slice(1).join("|") }
}

async function main() {
  const spreadsheetId = process.env.SHEET_ID
  if (!spreadsheetId) throw new Error("Falta SHEET_ID")
  const gid = process.env.SHEET_GID || DEFAULT_GID
  const confirm = process.argv.includes("--confirm")

  const sheets = await getSheetsClient()

  const { data: meta } = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.sheets.find((s) => String(s.properties.sheetId) === String(gid))
  if (!sheet) throw new Error(`No encontré una pestaña con gid=${gid}.`)
  const title = sheet.properties.title

  const { data: row1 } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!1:1`,
  })
  const headers = row1.values?.[0] || []
  const codigoCol = headers.indexOf("codigo_interno")
  const imagenCol = headers.indexOf("imagen")
  const imagenesAdicionalesCol = headers.indexOf("imagenes_adicionales")
  if (codigoCol === -1 || imagenCol === -1 || imagenesAdicionalesCol === -1) {
    throw new Error("No encontré codigo_interno / imagen / imagenes_adicionales en la fila 1.")
  }

  const { data: allRows } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!A2:BD10000`,
  })
  const rows = allRows.values || []

  const updates = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const codigo = row[codigoCol]
    if (!codigo || !MIGRATIONS[codigo]) continue

    const sheetRow = i + 2 // 1-indexed + header
    const [slug, count] = MIGRATIONS[codigo]
    const { imagen: newImagen, imagenesAdicionales: newImagenesAdicionales } = newValues(slug, count)

    const oldImagen = row[imagenCol] || ""
    const oldImagenesAdicionales = row[imagenesAdicionalesCol] || ""

    if (oldImagen === newImagen && oldImagenesAdicionales === newImagenesAdicionales) {
      console.log(`${codigo} (fila ${sheetRow}): ya migrado, se omite.`)
      continue
    }

    console.log(`${codigo} (fila ${sheetRow}):`)
    console.log(`  imagen: ${JSON.stringify(oldImagen)} -> ${JSON.stringify(newImagen)}`)
    console.log(`  imagenes_adicionales: ${JSON.stringify(oldImagenesAdicionales)} -> ${JSON.stringify(newImagenesAdicionales)}`)

    updates.push({
      range: `'${title}'!${columnLetter(imagenCol)}${sheetRow}:${columnLetter(imagenesAdicionalesCol)}${sheetRow}`,
      imagenCol,
      imagenesAdicionalesCol,
      sheetRow,
      newImagen,
      newImagenesAdicionales,
    })
  }

  console.log(`\n${updates.length} fila(s) para actualizar.`)

  if (!confirm) {
    console.log("Dry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  if (updates.length === 0) {
    console.log("Nada que aplicar.")
    return
  }

  const data = []
  for (const u of updates) {
    data.push({
      range: `'${title}'!${columnLetter(u.imagenCol)}${u.sheetRow}`,
      values: [[u.newImagen]],
    })
    data.push({
      range: `'${title}'!${columnLetter(u.imagenesAdicionalesCol)}${u.sheetRow}`,
      values: [[u.newImagenesAdicionales]],
    })
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "RAW", data },
  })

  console.log("Listo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
