// Fills the "proveedor_direccion" column in the "Experiencias" sheet for rows
// whose address was researched via web search (Instagram/Google Maps/sitio
// oficial), confirmed with the user row by row. Only rows in ADDRESSES below
// are touched -- everything else is left untouched (blank/manual pending).
//
// Requires scripts/sheet-sync/authorize.mjs to have been run once already.
//
// Usage (dry run, default -- just shows what would change):
//   SHEET_ID=<spreadsheet id from the edit URL> node scripts/sheet-sync/fill-proveedor-direccion.mjs
//
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/fill-proveedor-direccion.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const HEADER = "proveedor_direccion"
const DEFAULT_GID = "1700161859"

// __row (1-indexed incl. header) -> [codigo_interno, direccion] for logging/sanity check
const ADDRESSES = {
  2: ["AVE-CNO-001", "Km 23 vía Bogotá-Tunja, vereda La Esmeralda, sector La Escuela, Tocancipá, Cundinamarca"],
  4: ["AVE-COR-001", "Vereda Romero Alto, Choachí, Cundinamarca"],
  5: ["AVE-COR-002", "Km 5.4 vía Bogotá-La Calera, sector San Isidro Rural, La Calera, Cundinamarca"],
  6: ["AVE-COR-003", "Km 5.4 vía Bogotá-La Calera, sector San Isidro Rural, La Calera, Cundinamarca"],
  7: ["AVE-COR-004", "Km 5.4 vía Bogotá-La Calera, sector San Isidro Rural, La Calera, Cundinamarca"],
  8: ["BIE-BOG-001", "Calle 134 Bis #18-36, Contador, Bogotá"],
  9: ["EST-COR-001", "Vereda Romero Alto, Choachí, Cundinamarca"],
  10: ["EST-COR-002", "Vereda Río Blanco, Choachí, Cundinamarca"],
  11: ["GAS-BOG-001", "Carrera 4 #12C-34, La Candelaria, Bogotá"],
  12: ["GAS-BOG-002", "Carrera 4 Bis #58-60, Chapinero Alto, Bogotá"],
  13: ["GAS-CNO-001", "Calle 7 #12-21, CC Terranova, Pacho, Cundinamarca"],
  14: ["CUL-BOG-001", "Carrera 75 #25F-30, Modelia, Bogotá"],
  15: ["AVE-COC-001", "Carrera 3 #6-65, Útica, Cundinamarca"],
  16: ["AVE-COC-002", "Carrera 3 #6-65, Útica, Cundinamarca"],
  17: ["AVE-COC-003", "Carrera 3 #6-65, Útica, Cundinamarca"],
  18: ["AVE-COC-004", "Carrera 3 #6-65, Útica, Cundinamarca"],
  19: ["AVE-COC-005", "Carrera 3 #6-65, Útica, Cundinamarca"],
  20: ["GAS-BOG-006", "Carrera 4 #12B-13, La Candelaria, Bogotá"],
  21: ["GAS-BOG-007", "Carrera 4 #12B-13, La Candelaria, Bogotá"],
  23: ["AVE-COC-006", "Vía Principal Tobia, Tobia, Nimaima, Cundinamarca"],
  24: ["AVE-COC-007", "Vía Principal Tobia, Tobia, Nimaima, Cundinamarca"],
  25: ["AVE-COC-008", "Vía Principal Tobia, Tobia, Nimaima, Cundinamarca"],
  26: ["AVE-COC-009", "Vía Principal Tobia, Tobia, Nimaima, Cundinamarca"],
  27: ["CUL-BOG-002", "Calle 12B #2-44, La Candelaria, Bogotá"],
  28: ["CUL-BOG-004", "Calle 62 #9A-65, Chapinero, Bogotá"],
  29: ["CUL-BOG-005", "Calle 62 #9A-65, Chapinero, Bogotá"],
  30: ["CUL-BOG-006", "Calle 62 #9A-65, Chapinero, Bogotá"],
  31: ["CUL-BOG-007", "Calle 62 #9A-65, Chapinero, Bogotá"],
  32: ["CUL-BOG-008", "Cra. 7 #115-72, Local A-213, CC Hacienda Santa Bárbara, Bogotá"],
  33: ["AVE-COR-006", "Km 13-14 vía Bogotá-La Calera, frente a Represa San Rafael, La Calera, Cundinamarca"],
  34: ["AVE-COR-007", "Km 13-14 vía Bogotá-La Calera, frente a Represa San Rafael, La Calera, Cundinamarca"],
  36: ["BIE-BOG-002", "Barrio Santa Bárbara, Bogotá"],
  37: ["AVE-BOG-001", "Calle 20 #82-52, Sótano 1, CC Hayuelos, Bogotá"],
  39: ["BIE-COR-001", "Kilómetro 9 vía Bogotá-La Calera, La Calera, Cundinamarca"],
  40: ["BIE-COR-002", "Kilómetro 9 vía Bogotá-La Calera, La Calera, Cundinamarca"],
  // 3 (AVE-CNO-002, Aventura Travel), 22 (BIE-BOG-003, Harmony Spa a domicilio),
  // 35 (AVE-COR-008, Andanzas Travel) and 38 (AVE-COR-005, Andanzas Travel)
  // intentionally left out -- no reliable fixed address found.
}

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
  const colIndex = headers.indexOf(HEADER)
  if (colIndex === -1) {
    throw new Error(`No encontré la columna "${HEADER}" en la fila 1 de "${title}".`)
  }
  const col = columnLetter(colIndex)

  // Sanity check codigo_interno column matches what we expect per row before writing.
  const codigoColIndex = headers.indexOf("codigo_interno")
  const codigoCol = columnLetter(codigoColIndex)
  const rows = Object.keys(ADDRESSES).map(Number).sort((a, b) => a - b)
  const { data: codigoData } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!${codigoCol}${rows[0]}:${codigoCol}${rows[rows.length - 1]}`,
  })
  const codigoValues = codigoData.values || []

  const mismatches = []
  for (const row of rows) {
    const actual = (codigoValues[row - rows[0]]?.[0] || "").trim()
    const [expected] = ADDRESSES[row]
    if (actual !== expected) mismatches.push({ row, expected, actual })
  }
  if (mismatches.length) {
    console.error("El sheet cambió desde que se armó este mapeo -- abortando. Discrepancias:")
    mismatches.forEach((m) => console.error(`  fila ${m.row}: esperaba ${m.expected}, encontré "${m.actual}"`))
    process.exit(1)
  }

  console.log(`Pestaña "${title}", columna ${col} (${HEADER}). ${rows.length} filas a escribir:`)
  for (const row of rows) {
    const [codigo, direccion] = ADDRESSES[row]
    console.log(`  fila ${row} (${codigo}): ${direccion}`)
  }

  if (!confirm) {
    console.log("\nDry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  const data = rows.map((row) => ({
    range: `'${title}'!${col}${row}`,
    values: [[ADDRESSES[row][1]]],
  }))

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "RAW", data },
  })

  console.log("\nListo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
