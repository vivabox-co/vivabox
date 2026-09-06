// Moves the "actividades_extra" column (added by add-actividades-extra.mjs,
// originally placed after "claves_eleccion") to sit between "incluye" and
// "requisitos" instead. Also clears the TRUE/FALSE checkbox data validation
// it inherited from a neighboring column when it was first inserted --
// see fix-actividades-extra-validation.mjs for why that happened.
//
// Usage (dry run, default):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/move-actividades-extra.mjs
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/move-actividades-extra.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const MOVE_HEADER = "actividades_extra"
const BEFORE_HEADER = "requisitos" // new column lands right before this one
const DEFAULT_GID = "1700161859"

async function main() {
  const spreadsheetId = process.env.SHEET_ID
  if (!spreadsheetId) {
    throw new Error("Falta SHEET_ID (el ID en la URL de edición del sheet).")
  }
  const gid = process.env.SHEET_GID || DEFAULT_GID
  const confirm = process.argv.includes("--confirm")

  const sheets = await getSheetsClient()

  const { data: meta } = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.sheets.find((s) => String(s.properties.sheetId) === String(gid))
  if (!sheet) {
    throw new Error(`No encontré una pestaña con gid=${gid}.`)
  }
  const title = sheet.properties.title
  const rowCount = sheet.properties.gridProperties.rowCount

  const { data: row1 } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!1:1`,
  })
  const headers = row1.values?.[0] || []

  const sourceIndex = headers.indexOf(MOVE_HEADER)
  if (sourceIndex === -1) {
    throw new Error(`No encontré la columna "${MOVE_HEADER}" en la fila 1 de "${title}".`)
  }
  const destIndex = headers.indexOf(BEFORE_HEADER)
  if (destIndex === -1) {
    throw new Error(`No encontré la columna "${BEFORE_HEADER}" en la fila 1 de "${title}".`)
  }

  console.log(
    `Pestaña "${title}": se mueve "${MOVE_HEADER}" (índice ${sourceIndex}) a justo antes de ` +
    `"${BEFORE_HEADER}" (índice ${destIndex}), y se limpia su validación TRUE/FALSE.`
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
          moveDimension: {
            source: {
              sheetId: sheet.properties.sheetId,
              dimension: "COLUMNS",
              startIndex: sourceIndex,
              endIndex: sourceIndex + 1,
            },
            destinationIndex: destIndex,
          },
        },
        {
          setDataValidation: {
            range: {
              sheetId: sheet.properties.sheetId,
              startRowIndex: 1,
              endRowIndex: rowCount,
              startColumnIndex: destIndex,
              endColumnIndex: destIndex + 1,
            },
            rule: null,
          },
        },
      ],
    },
  })

  console.log("Listo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
