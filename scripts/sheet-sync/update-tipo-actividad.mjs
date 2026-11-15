// Fixes the "tipo_actividad" column across all 39 rows of the "Experiencias"
// sheet -- most rows had a leftover "kayak" copy-paste value unrelated to the
// actual experience, a few had invalid/miscased values ("camera", "Karting"),
// and a few were empty. Each row is remapped to the closest key present in
// vivabox-appben's VALID_ACTIVITY_KEYS whitelist (lib/map/activityLabels.ts),
// preferring an exact match (e.g. "cabalgata" -> horseback) and falling back
// to the closest thematic analog when no exact key exists (e.g. rafting ->
// climbing, since rappel is the closest matching key) -- confirmed with the
// user in chat rather than adding new keys/icons to the other repo.
//
// Requires scripts/sheet-sync/authorize.mjs to have been run once already.
//
// Usage (dry run, default -- just shows what would change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/update-tipo-actividad.mjs
//
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/update-tipo-actividad.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"

const NEW_VALUES = {
  "AVE-CNO-001": "motorbike",
  "AVE-CNO-002": "climbing",
  "AVE-COR-001": "hiking",
  "AVE-COR-002": "horseback",
  "AVE-COR-003": "climbing",
  "AVE-COR-004": "horseback",
  "BIE-BOG-001": "meditation",
  "EST-COR-001": "eco_lodge",
  "EST-COR-002": "eco_lodge",
  "GAS-BOG-001": "bbq",
  "GAS-BOG-002": "dining",
  "GAS-CNO-001": "sushi_class",
  "CUL-BOG-001": "photoshoot",
  "AVE-COC-001": "climbing",
  "AVE-COC-002": "buggy",
  "AVE-COC-003": "paragliding",
  "AVE-COC-004": "buggy",
  "AVE-COC-005": "horseback",
  "GAS-BOG-006": "coffee_tasting",
  "GAS-BOG-007": "chef_hat",
  "BIE-BOG-003": "massage",
  "AVE-COC-006": "karting",
  "AVE-COC-007": "climbing",
  "AVE-COC-008": "horseback",
  "AVE-COC-009": "bungee",
  "CUL-BOG-002": "theater",
  "CUL-BOG-004": "theater",
  "CUL-BOG-005": "theater",
  "CUL-BOG-006": "theater",
  "CUL-BOG-007": "theater",
  "CUL-BOG-008": "photoshoot",
  "AVE-COR-006": "golf",
  "AVE-COR-007": "golf",
  "AVE-COR-008": "hiking",
  "BIE-BOG-002": "ice_bath",
  "AVE-BOG-001": "karting",
  "AVE-COR-005": "scuba",
  "BIE-COR-001": "massage",
  "BIE-COR-002": "spa",
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

  const { data: full } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!A1:BD10000`,
  })
  const [header, ...rows] = full.values
  const codigoIdx = header.indexOf("codigo_interno")
  const tipoIdx = header.indexOf("tipo_actividad")
  if (codigoIdx === -1 || tipoIdx === -1) {
    throw new Error("No encontré las columnas codigo_interno / tipo_actividad.")
  }
  const col = columnLetter(tipoIdx)

  const updates = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const codigo = (row[codigoIdx] || "").trim()
    if (!codigo || !NEW_VALUES[codigo]) continue
    const current = row[tipoIdx] || ""
    const next = NEW_VALUES[codigo]
    const sheetRow = i + 2
    if (current === next) continue
    updates.push({ codigo, sheetRow, current: current || "(vacío)", next })
  }

  const missing = Object.keys(NEW_VALUES).filter(
    (c) => !rows.some((r) => (r[codigoIdx] || "").trim() === c)
  )
  if (missing.length) {
    console.log("Aviso -- codigo_interno no encontrados en el sheet:", missing.join(", "))
  }

  console.log(`Pestaña "${title}", columna ${col}. ${updates.length} filas a actualizar:`)
  for (const u of updates) {
    console.log(`  fila ${u.sheetRow} (${u.codigo}): "${u.current}" -> "${u.next}"`)
  }

  if (!confirm) {
    console.log("\nDry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  if (updates.length === 0) {
    console.log("Nada que escribir.")
    return
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: updates.map((u) => ({
        range: `'${title}'!${col}${u.sheetRow}`,
        values: [[u.next]],
      })),
    },
  })
  console.log(`\nListo -- ${updates.length} filas actualizadas.`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
