// One-off: fixes rows where "tipo_actividad" is free-text description instead
// of a slug matching an icon committed in vivabox-appben/public/icons/*.svg.
// Found by cross-checking every row's normalized tipo_actividad against that
// icon folder -- these 6 fell back silently to the default "dining" pin icon
// on the beneficiary app's map (see BIE-CNO-001 investigation for how this
// class of bug surfaces).
//
// Usage (dry run, default):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/fix-tipo-actividad-mismatches.mjs
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/fix-tipo-actividad-mismatches.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"

// Mapped to the nearest existing valid activity_key (vivabox-appben's
// VALID_ACTIVITY_KEYS) rather than inventing a new one -- see docs on
// mapping to closest existing key over proposing new ones.
const FIXES = {
  "AVE-BOG-003": { was: "Iniciacion al tiro", now: "gun" },
  "AVE-BOG-005": { was: "Iniciacion al tiro", now: "gun" },
  "AVE-BOG-004": { was: "Vuelo en tunnel de gravedad", now: "wind_tunnel" },
  "GAS-BOG-008": { was: "Almuerzo o cena", now: "dining" },
  "GAS-COR-001": { was: "Cena", now: "dining" },
  // Least confident mapping -- "bolt" has no close equivalent among existing
  // keys for a neighborhood walking tour; "hiking" (Senderismo icon) is the
  // nearest available, flagged for review rather than left broken.
  "CUL-BOG-009": { was: "bolt", now: "hiking" },
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
  if (!spreadsheetId) throw new Error("Falta SHEET_ID")
  const gid = process.env.SHEET_GID || DEFAULT_GID
  const confirm = process.argv.includes("--confirm")

  const sheets = await getSheetsClient()
  const { data: meta } = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.sheets.find((s) => String(s.properties.sheetId) === String(gid))
  if (!sheet) throw new Error(`No encontré una pestaña con gid=${gid}.`)
  const title = sheet.properties.title

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!A1:BF10000`,
  })
  const [header, ...rows] = data.values
  const codeCol = header.indexOf("codigo_interno")
  const actCol = header.indexOf("tipo_actividad")

  const valueRanges = []
  for (const [code, { was, now }] of Object.entries(FIXES)) {
    const rowIndex = rows.findIndex((r) => (r[codeCol] || "").trim() === code)
    if (rowIndex === -1) {
      console.log(`AVISO: no encontré ${code}, la salto`)
      continue
    }
    const sheetRow = rowIndex + 2
    const current = (rows[rowIndex][actCol] || "").trim()
    if (current !== was) {
      console.log(`AVISO: ${code} tipo_actividad actual (${JSON.stringify(current)}) ya no es ${JSON.stringify(was)}, la salto por seguridad`)
      continue
    }
    console.log(`${code} (fila ${sheetRow}): "${was}" -> "${now}"`)
    valueRanges.push({
      range: `'${title}'!${columnLetter(actCol)}${sheetRow}`,
      values: [[now]],
    })
  }

  console.log(`\n${valueRanges.length} celdas para actualizar.`)

  if (!confirm) {
    console.log("Dry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  if (valueRanges.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: "RAW", data: valueRanges },
    })
  }

  console.log("Listo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
