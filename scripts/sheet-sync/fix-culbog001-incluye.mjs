// One-off: CUL-BOG-001's "incluye" said "Impresiones de fotos", contradicting
// the old descripcion_corta which said prints were NOT included. User
// confirmed on 2026-08-23: prints are not included. Fixes the incluye cell
// to match (and drops the now-resolved contradiction).
//
// Usage: SHEET_ID=... node scripts/sheet-sync/fix-culbog001-incluye.mjs [--confirm]

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"
const CODE = "CUL-BOG-001"
const NEW_VALUE = "5 fotos con edición básica de color (las adicionales que se logren también se editan; no incluye impresiones)."

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
  const incluyeCol = header.indexOf("incluye")

  const rowIndex = rows.findIndex((r) => (r[codeCol] || "").trim() === CODE)
  if (rowIndex === -1) throw new Error(`No encontré ${CODE}`)
  const sheetRow = rowIndex + 2
  const current = rows[rowIndex][incluyeCol] || ""
  const col = columnLetter(incluyeCol)

  console.log(`${CODE} (fila ${sheetRow}, columna ${col})`)
  console.log(`  antes: ${current}`)
  console.log(`  después: ${NEW_VALUE}`)

  if (!confirm) {
    console.log("\nDry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${title}'!${col}${sheetRow}`,
    valueInputOption: "RAW",
    requestBody: { values: [[NEW_VALUE]] },
  })
  console.log("\nListo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
