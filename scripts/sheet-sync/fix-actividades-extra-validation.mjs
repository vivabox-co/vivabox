// The insertDimension call in add-actividades-extra.mjs (inheritFromBefore:
// false) ended up inheriting the TRUE/FALSE checkbox data validation from the
// column that shifted right after it ("requiere_telefono"), instead of being
// a plain free-text column. This clears that data validation from the
// "actividades_extra" column across all data rows.
//
// Usage (dry run, default):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/fix-actividades-extra-validation.mjs
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/fix-actividades-extra-validation.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const HEADER = "actividades_extra"
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
  const colIndex = headers.indexOf(HEADER)
  if (colIndex === -1) {
    throw new Error(`No encontré la columna "${HEADER}" en la fila 1 de "${title}".`)
  }

  console.log(
    `Pestaña "${title}": se limpia la validación de datos (TRUE/FALSE) de la columna ` +
    `"${HEADER}" (índice ${colIndex}), filas 2 a ${rowCount}.`
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
