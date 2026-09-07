// Adds "solo o duo" as a third accepted value to the "formato" column's dropdown
// (data validation), alongside the existing "solo" and "duo". For experiences
// that can be booked either as one person or as a pair.
//
// Usage (dry run, default):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/add-formato-solo-o-duo.mjs
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/add-formato-solo-o-duo.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const HEADER = "formato"
const DEFAULT_GID = "1700161859"
const NEW_VALUE = "solo o duo"

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
  const colIndex = headers.indexOf(HEADER)
  if (colIndex === -1) {
    throw new Error(`No encontré la columna "${HEADER}" en la fila 1 de "${title}".`)
  }

  console.log(
    `Pestaña "${title}": se agrega "${NEW_VALUE}" a la validación de datos (dropdown) de la columna ` +
    `"${HEADER}" (índice ${colIndex}), filas 2 a ${rowCount}. Valores existentes: solo, duo.`
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
          setDataValidation: {
            range: {
              sheetId: sheet.properties.sheetId,
              startRowIndex: 1,
              endRowIndex: rowCount,
              startColumnIndex: colIndex,
              endColumnIndex: colIndex + 1,
            },
            rule: {
              condition: {
                type: "ONE_OF_LIST",
                values: [
                  { userEnteredValue: "solo" },
                  { userEnteredValue: "duo" },
                  { userEnteredValue: NEW_VALUE },
                ],
              },
              showCustomUi: true,
            },
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
