// Read-only inspection of the "formato" column's current data validation rule.
// Usage: SHEET_ID=<spreadsheet id> node scripts/sheet-sync/inspect-formato-validation.mjs

import { getSheetsClient } from "./client.mjs"

const HEADER = "formato"
const DEFAULT_GID = "1700161859"

async function main() {
  const spreadsheetId = process.env.SHEET_ID
  if (!spreadsheetId) throw new Error("Falta SHEET_ID")
  const gid = process.env.SHEET_GID || DEFAULT_GID

  const sheets = await getSheetsClient()

  const { data: meta } = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.sheets.find((s) => String(s.properties.sheetId) === String(gid))
  if (!sheet) throw new Error(`No encontré una pestaña con gid=${gid}.`)
  const title = sheet.properties.title
  const rowCount = sheet.properties.gridProperties.rowCount

  const { data: row1 } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!1:1`,
  })
  const headers = row1.values?.[0] || []
  const colIndex = headers.indexOf(HEADER)
  if (colIndex === -1) throw new Error(`No encontré la columna "${HEADER}".`)

  console.log(`Columna "${HEADER}" en índice ${colIndex} (0-based), pestaña "${title}", rowCount=${rowCount}`)

  const colLetter = String.fromCharCode(65 + colIndex)
  const { data: full } = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: [`'${title}'!${colLetter}2:${colLetter}${Math.min(rowCount, 15)}`],
    fields: "sheets.data.rowData.values(userEnteredValue,dataValidation)",
  })

  const rows = full.sheets?.[0]?.data?.[0]?.rowData || []
  rows.forEach((r, i) => {
    const v = r.values?.[0]
    console.log(
      `Fila ${i + 2}: valor=${JSON.stringify(v?.userEnteredValue)} validation=${JSON.stringify(v?.dataValidation)}`
    )
  })
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
