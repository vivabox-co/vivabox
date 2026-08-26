// Renames the "badges_visibles" header cell to "claves_eleccion" in the
// "Experiencias" sheet, matching the src/services/sheet.ts HEADER_MAP change.
// Only touches the single header cell -- no other data is read or modified.
//
// Requires scripts/sheet-sync/authorize.mjs to have been run once already.
//
// Usage (dry run, default -- just shows what would change):
//   SHEET_ID=<spreadsheet id from the edit URL> node scripts/sheet-sync/rename-column.mjs
//
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/rename-column.mjs --confirm
//
// Optional: SHEET_GID=<tab gid> to target a specific tab (defaults to the
// "Experiencias" tab's gid from the published CSV URL in src/services/sheet.ts).

import { getSheetsClient } from "./client.mjs"

const OLD_HEADER = "badges_visibles"
const NEW_HEADER = "claves_eleccion"
const DEFAULT_GID = "1700161859"

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

  if (headers.includes(NEW_HEADER)) {
    console.log(`Ya está renombrada: la columna "${NEW_HEADER}" ya existe en "${title}".`)
    return
  }

  const colIndex = headers.indexOf(OLD_HEADER)
  if (colIndex === -1) {
    throw new Error(`No encontré la columna "${OLD_HEADER}" en la fila 1 de "${title}".`)
  }

  const col = columnLetter(colIndex)
  console.log(`Pestaña "${title}": columna ${col} pasa de "${OLD_HEADER}" a "${NEW_HEADER}".`)

  if (!confirm) {
    console.log("Dry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${title}'!${col}1`,
    valueInputOption: "RAW",
    requestBody: { values: [[NEW_HEADER]] },
  })
  console.log("Listo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
