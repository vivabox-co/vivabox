// Fills the "proveedor_instagram" column in the "Experiencias" sheet for rows
// whose provider's Instagram was found via web search (official site or
// Instagram profile itself), confirmed against matching address/phone in the
// sheet. Only rows in INSTAGRAMS below are touched -- everything else is left
// untouched (blank/manual pending).
//
// Requires scripts/sheet-sync/authorize.mjs to have been run once already.
//
// Usage (dry run, default -- just shows what would change):
//   SHEET_ID=<spreadsheet id from the edit URL> node scripts/sheet-sync/fill-proveedor-instagram.mjs
//
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/fill-proveedor-instagram.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const HEADER = "proveedor_instagram"
const DEFAULT_GID = "1700161859"

// __row (1-indexed incl. header) -> [codigo_interno, instagram] for logging/sanity check
const INSTAGRAMS = {
  14: ["CUL-BOG-001", "@studio.bogota"], // Lond Studio -- lond.com.co footer, address matches exactly
  20: ["GAS-BOG-006", "@cacaote.store"], // Cacaote -- address matches exactly (Cra 4 #12b-13)
  21: ["GAS-BOG-007", "@cacaote.store"],
  23: ["AVE-COC-006", "@adventureriverscolombia"], // Adventure Rivers -- phone matches exactly (3107215568)
  24: ["AVE-COC-007", "@adventureriverscolombia"],
  25: ["AVE-COC-008", "@adventureriverscolombia"],
  26: ["AVE-COC-009", "@adventureriverscolombia"],
  27: ["CUL-BOG-002", "@teatrolibre"], // Teatro Libre -- both sedes match addresses exactly
  28: ["CUL-BOG-004", "@teatrolibre"],
  29: ["CUL-BOG-005", "@teatrolibre"],
  30: ["CUL-BOG-006", "@teatrolibre"],
  31: ["CUL-BOG-007", "@teatrolibre"],
  32: ["CUL-BOG-008", "@fotoestudiorasgo"], // Rasgo -- phone matches exactly (3008946101)
  33: ["AVE-COR-006", "@lacimaclubdegolf"], // Golf La Cima -- only golf club at that La Calera address
  34: ["AVE-COR-007", "@lacimaclubdegolf"],
  35: ["AVE-COR-008", "@andanzastravel"], // Andanzas Travel -- andanzastravel.com.co footer
  36: ["BIE-BOG-002", "@bajocero.club"], // Bajo Cero -- Santa Bárbara Bogotá matches
  37: ["AVE-BOG-001", "@superkartsco"], // Superkarts -- Hayuelos address matches exactly
  38: ["AVE-COR-005", "@andanzastravel"],
  39: ["BIE-COR-001", "@clubduchi_oficial"], // Club Duchi -- km 9 vía La Calera matches
  40: ["BIE-COR-002", "@clubduchi_oficial"],
  // 15-19 (AVE-COC-001..005, Mundo Extremo, Útica) intentionally left out --
  // couldn't confirm which "Mundo Extremo" Instagram account is theirs
  // (phone 319 251 1530 didn't match any candidate found).
  // 22 (BIE-BOG-003, Harmony Spa) intentionally left out -- phone confirmed
  // (323 948 5125) but no public Instagram account found for the business.
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
  const rows = Object.keys(INSTAGRAMS).map(Number).sort((a, b) => a - b)
  const { data: codigoData } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!${codigoCol}${rows[0]}:${codigoCol}${rows[rows.length - 1]}`,
  })
  const codigoValues = codigoData.values || []

  const mismatches = []
  for (const row of rows) {
    const actual = (codigoValues[row - rows[0]]?.[0] || "").trim()
    const [expected] = INSTAGRAMS[row]
    if (actual !== expected) mismatches.push({ row, expected, actual })
  }
  if (mismatches.length) {
    console.error("El sheet cambió desde que se armó este mapeo -- abortando. Discrepancias:")
    mismatches.forEach((m) => console.error(`  fila ${m.row}: esperaba ${m.expected}, encontré "${m.actual}"`))
    process.exit(1)
  }

  console.log(`Pestaña "${title}", columna ${col} (${HEADER}). ${rows.length} filas a escribir:`)
  for (const row of rows) {
    const [codigo, instagram] = INSTAGRAMS[row]
    console.log(`  fila ${row} (${codigo}): ${instagram}`)
  }

  if (!confirm) {
    console.log("\nDry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  const data = rows.map((row) => ({
    range: `'${title}'!${col}${row}`,
    values: [[INSTAGRAMS[row][1]]],
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
