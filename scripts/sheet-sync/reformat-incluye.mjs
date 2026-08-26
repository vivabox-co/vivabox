// One-off: standardizes "incluye" across all 22 rows to the " · "-separated
// short-list format (no full sentences, no price/conditions/adjectives,
// 3-6 items when that many are confirmed, most important first).
//
// Usage: SHEET_ID=... node scripts/sheet-sync/reformat-incluye.mjs [--confirm]

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"

const INCLUYE = {
  "AVE-CNO-001": "45 minutos en pista · moto · casco · protecciones",
  "AVE-CNO-002": "Guía especializado · equipo de seguridad · sesión de escalada",
  "AVE-COR-001": "Caminata guiada · guía · seguro",
  "AVE-COR-002": "Cabalgata de una hora (2 personas) · 2 parrilladas",
  "AVE-COR-003": "Canopy de 170 m · rápel de 22 m · puentes colgantes · escalada de árbol · muro de escalada deportiva · cabalgata",
  "AVE-COR-004": "Cabalgata de 2.5 horas · parrillada · refrigerio (agua de panela, arepa, queso, almojábana) · canelazo · seguro",
  "BIE-BOG-001": "Orientación · 1 hora de flotación · espacio de meditación · bebida caliente",
  "EST-CNO-001": "Noche en domo de glamping",
  "EST-COR-001": "Noche de alojamiento · fogata (solo entre semana)",
  "EST-COR-002": "Noche de alojamiento · desayuno · chimenea",
  "GAS-BOG-001": "Entrada · plato fuerte · postre · agua",
  "GAS-BOG-002": "Entrada · plato fuerte · postre · 2 bebidas",
  "GAS-BOG-003": "Taller con instructor · cata de cacao · materiales",
  "GAS-BOG-004": "Brunch · café",
  "GAS-BOG-005": "Degustación de pasteles · café",
  "GAS-CNO-001": "Taller con instructor · 2 rollos de práctica · 2 rollos normales · 1 rollo del chef · taller de cóctel · taller de postre",
  "CUL-BOG-001": "Sesión de fotos de estudio de 30 minutos · 5 fotos con edición básica de color · fotos adicionales editadas",
  "AVE-COC-001": "Rafting de 6 km · circuito aéreo Las Ceibas · rápel en roca seca (25 m) · almuerzo · piscina · póliza de asistencia",
  "AVE-COC-002": "Cuatrimoto (4 km) · circuito aéreo Las Ceibas · rápel en roca seca (25 m) · almuerzo · piscina · póliza de asistencia",
  "AVE-COC-003": "Canopy Superman (1.260 m) · rápel en roca seca (25 m) · cuatrimoto (4 km) · almuerzo · piscina · póliza de asistencia",
  "AVE-COC-004": "Rafting de 6 km · cuatrimoto (4 km) · almuerzo · piscina · póliza de asistencia",
  "AVE-COC-005": "Rafting de 6 km · rápel en roca seca (25 m) · cabalgata guiada · almuerzo · piscina · póliza de asistencia",
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
  const incluyeCol = header.indexOf("incluye")
  const col = columnLetter(incluyeCol)

  const writes = []
  const missing = []
  const codes = Object.keys(INCLUYE)

  codes.forEach((code) => {
    const rowIndex = rows.findIndex((r) => (r[codeCol] || "").trim() === code)
    if (rowIndex === -1) { missing.push(code); return }
    const sheetRow = rowIndex + 2
    const current = rows[rowIndex][incluyeCol] || ""
    const next = INCLUYE[code]
    console.log(`${code} (fila ${sheetRow})`)
    console.log(`  antes: ${current}`)
    console.log(`  después: ${next}\n`)
    writes.push({ range: `'${title}'!${col}${sheetRow}`, values: [[next]] })
  })

  if (missing.length) throw new Error(`No encontré: ${missing.join(", ")}`)
  console.log(`${writes.length} filas a actualizar.`)

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
