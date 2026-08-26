// One-off: cleans up incluye / requisitos / nota_vestimenta for the 5
// AVE-COC-* draft rows, which had raw provider text pasted in (duplicated
// paragraphs, a bullet-list wardrobe/safety block copy-pasted identically
// into "requisitos" on all 5 rows, mixed with medical restrictions).
//
// - incluye: rewritten as a short, concrete list of what's actually
//   included per package (activities + almuerzo/piscina/póliza, which were
//   confirmed in the old descripcion_corta bullet lists but missing from
//   incluye itself).
// - requisitos: kept to the real eligibility/medical restrictions, dropped
//   the wardrobe tips (moved to nota_vestimenta, where they belong per the
//   sheet's own column dictionary) and the liability/omission clause.
// - nota_vestimenta: now holds the wardrobe/gear recommendations that were
//   previously buried in requisitos. Dropped the specific glove rental
//   price (pricing doesn't belong in this field).
//
// Usage: SHEET_ID=... node scripts/sheet-sync/clean-avecoc.mjs [--confirm]

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"

const REQUISITOS = "No pueden participar personas bajo efectos de alcohol o sustancias psicoactivas, en estado de embarazo, con enfermedades cardiovasculares, respiratorias, neurológicas o metabólicas no controladas, cirugías o lesiones recientes (fracturas, esguinces, lesiones musculares), o restricciones médicas para actividad física, acuática o en altura. Es obligatorio informar cualquier condición médica, alergia o limitación antes de participar."

const NOTA_VESTIMENTA = "Ropa deportiva cómoda y de secado rápido, pantalón largo, zapatos cerrados con buen agarre (no sandalias ni tacones), bloqueador solar, gorra y ropa de cambio para las actividades en el agua. Para el rápel y el circuito aéreo se recomienda usar guantes de protección."

const INCLUYE = {
  "AVE-COC-001": "Rafting de 6 km por el río Negro (rápidos nivel I-III) con acompañamiento y equipo de seguridad; circuito aéreo Las Ceibas (vuelos de 180 y 200 metros, puente colgante de 180 metros, rápel al vacío de 15 metros); rápel en roca seca de 25 metros con recorrido final de body rafting; almuerzo; acceso a piscina; póliza de asistencia.",
  "AVE-COC-002": "Recorrido de 4 km en cuatrimoto por caminos rurales de Útica; circuito aéreo Las Ceibas (vuelos de 180 y 200 metros, puente colgante de 180 metros, rápel al vacío de 15 metros); rápel en roca seca de 25 metros con recorrido final de body rafting; almuerzo; acceso a piscina; póliza de asistencia.",
  "AVE-COC-003": "Recorrido en canopy Superman de 1.260 metros, hasta 150 metros de altura sobre el valle del río Negro, con traslado y caminata de acceso incluidos; rápel en roca seca de 25 metros con recorrido final de body rafting; recorrido de 4 km en cuatrimoto por caminos rurales de Útica; almuerzo; acceso a piscina; póliza de asistencia.",
  "AVE-COC-004": "Rafting de 6 km por el río Negro (rápidos nivel I-III) con acompañamiento y equipo de seguridad; recorrido de 4 km en cuatrimoto por caminos rurales de Útica; almuerzo; acceso a piscina; póliza de asistencia.",
  "AVE-COC-005": "Rafting de 6 km por el río Negro (rápidos nivel I-III) con acompañamiento y equipo de seguridad; rápel en roca seca de 25 metros con recorrido final de body rafting; cabalgata guiada de 45 minutos a 1 hora por senderos rurales de Útica; almuerzo; acceso a piscina; póliza de asistencia.",
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
  const title = sheet.properties.title

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${title}'!A1:BD10000`,
  })
  const [header, ...rows] = data.values
  const codeCol = header.indexOf("codigo_interno")
  const cols = {
    incluye: header.indexOf("incluye"),
    requisitos: header.indexOf("requisitos"),
    nota_vestimenta: header.indexOf("nota_vestimenta"),
  }

  const writes = []
  const codes = Object.keys(INCLUYE)
  const missing = []

  codes.forEach((code) => {
    const rowIndex = rows.findIndex((r) => (r[codeCol] || "").trim() === code)
    if (rowIndex === -1) { missing.push(code); return }
    const sheetRow = rowIndex + 2

    const cells = { incluye: INCLUYE[code], requisitos: REQUISITOS, nota_vestimenta: NOTA_VESTIMENTA }
    console.log(`\n=== ${code} (fila ${sheetRow}) ===`)
    for (const [field, newValue] of Object.entries(cells)) {
      const col = columnLetter(cols[field])
      const current = rows[rowIndex][cols[field]] || ""
      console.log(`\n[${field}] columna ${col}`)
      console.log(`  antes: ${current.slice(0, 120)}${current.length > 120 ? "..." : ""}`)
      console.log(`  después: ${newValue}`)
      writes.push({ range: `'${title}'!${col}${sheetRow}`, values: [[newValue]] })
    }
  })

  if (missing.length) throw new Error(`No encontré: ${missing.join(", ")}`)

  console.log(`\n${writes.length} celdas a actualizar (5 filas x 3 columnas).`)

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
