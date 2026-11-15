// One-off: fills the missing "zona" column for AVE-COR-006 (ciudad = La Calera,
// outside Bogotá -> zona should be the department, Cundinamarca).
//
// Usage: SHEET_ID=... node scripts/sheet-sync/fix-avecor006-zona.mjs [--confirm]

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"
const CODE = "AVE-COR-006"
const NEW_VALUE = "Cundinamarca"

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
  if (!spreadsheetId) throw new Error("Falta SHEET_ID")
  const gid = process.env.SHEET_GID || DEFAULT_GID
  const confirm = process.argv.includes("--confirm")

  const sheets = await getSheetsClient()
  const { data: meta } = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.sheets.find((s) => String(s.properties.sheetId) === String(gid))
  const title = sheet.properties.title

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!A1:BD10000`,
  })
  const [header, ...rows] = data.values
  const codeCol = header.indexOf("codigo_interno")
  const cityCol = header.indexOf("ciudad")
  const zonaCol = header.indexOf("zona")
  const col = columnLetter(zonaCol)

  const rowIndex = rows.findIndex((r) => (r[codeCol] || "").trim() === CODE)
  if (rowIndex === -1) throw new Error(`No encontré: ${CODE}`)

  const sheetRow = rowIndex + 2
  const ciudad = rows[rowIndex][cityCol] || "(vacío)"
  const current = rows[rowIndex][zonaCol] || "(vacío)"

  console.log(`${CODE} (fila ${sheetRow}, columna ${col})`)
  console.log(`  ciudad: ${ciudad}`)
  console.log(`  zona antes: ${current}`)
  console.log(`  zona después: ${NEW_VALUE}\n`)

  if (!confirm) {
    console.log("Dry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${title}'!${col}${sheetRow}`,
    valueInputOption: "RAW",
    requestBody: { values: [[NEW_VALUE]] },
  })
  console.log("Listo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
