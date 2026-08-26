// One-off: adds the glove-rental price (dropped from nota_vestimenta during
// the AVE-COC-* cleanup) to nota_extra instead, per user request.
//
// Usage: SHEET_ID=... node scripts/sheet-sync/add-nota-extra-guantes.mjs [--confirm]

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"
const CODES = ["AVE-COC-001", "AVE-COC-002", "AVE-COC-003", "AVE-COC-004", "AVE-COC-005"]
const NEW_VALUE = "Alquiler de guantes de protección para el rápel y el circuito aéreo (si no se cuenta con guantes propios): $5.000."

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
  const notaExtraCol = header.indexOf("nota_extra")
  const col = columnLetter(notaExtraCol)

  const writes = []
  const missing = []

  CODES.forEach((code) => {
    const rowIndex = rows.findIndex((r) => (r[codeCol] || "").trim() === code)
    if (rowIndex === -1) { missing.push(code); return }
    const sheetRow = rowIndex + 2
    const current = rows[rowIndex][notaExtraCol] || "(vacío)"
    console.log(`${code} (fila ${sheetRow}, columna ${col})`)
    console.log(`  antes: ${current}`)
    console.log(`  después: ${NEW_VALUE}\n`)
    writes.push({ range: `'${title}'!${col}${sheetRow}`, values: [[NEW_VALUE]] })
  })

  if (missing.length) throw new Error(`No encontré: ${missing.join(", ")}`)

  if (!confirm) {
    console.log("Dry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "RAW", data: writes },
  })
  console.log("Listo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
