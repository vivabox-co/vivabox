// Read-only dump of the "Experiencias" tab as JSON, for content-review scripts.
// Usage: SHEET_ID=... node scripts/sheet-sync/dump-experiences.mjs > /tmp/experiences.json

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"

async function main() {
  const spreadsheetId = process.env.SHEET_ID
  if (!spreadsheetId) throw new Error("Falta SHEET_ID")
  const gid = process.env.SHEET_GID || DEFAULT_GID

  const sheets = await getSheetsClient()
  const { data: meta } = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.sheets.find((s) => String(s.properties.sheetId) === String(gid))
  const title = sheet.properties.title

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!A1:BD10000`,
  })
  const [header, ...rows] = data.values

  const records = rows
    .map((row, i) => {
      const rec = {}
      header.forEach((h, j) => { rec[h] = row[j] ?? "" })
      rec.__row = i + 2 // 1-indexed + header
      return rec
    })
    .filter((r) => r.codigo_interno && r.codigo_interno.trim())

  console.log(JSON.stringify(records, null, 2))
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
