// Inserts a new "proveedor_direccion" column into the "Experiencias" sheet,
// right after "proveedor_instagram" (end of the proveedor_* contact block).
// Optional field, internal use only -- never shown to the buyer.
//
// Requires scripts/sheet-sync/authorize.mjs to have been run once already.
//
// Usage (dry run, default -- just shows what would change):
//   SHEET_ID=<spreadsheet id from the edit URL> node scripts/sheet-sync/add-proveedor-direccion.mjs
//
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/add-proveedor-direccion.mjs --confirm
//
// Optional: SHEET_GID=<tab gid> to target a specific tab (defaults to the
// "Experiencias" tab's gid from the published CSV URL in src/services/sheet.ts).

import { getSheetsClient } from "./client.mjs"

const AFTER_HEADER = "proveedor_instagram"
const NEW_HEADER = "proveedor_direccion"
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
    console.log(`Ya existe: la columna "${NEW_HEADER}" ya está en "${title}".`)
    return
  }

  const afterIndex = headers.indexOf(AFTER_HEADER)
  if (afterIndex === -1) {
    throw new Error(`No encontré la columna "${AFTER_HEADER}" en la fila 1 de "${title}".`)
  }

  const insertIndex = afterIndex + 1 // 0-indexed position for the new column
  const col = columnLetter(insertIndex)

  console.log(
    `Pestaña "${title}": se inserta la columna "${NEW_HEADER}" en la posición ${col} ` +
    `(justo después de "${AFTER_HEADER}").`
  )

  if (!confirm) {
    console.log("Dry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: "COLUMNS",
              startIndex: insertIndex,
              endIndex: insertIndex + 1,
            },
            inheritFromBefore: false,
          },
        },
      ],
    },
  })

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
