// One-off: rewrites descripcion_corta for the 11 rows reviewed in chat on
// 2026-08-23 (banned phrases, unconfirmed specifics, price info, or
// bullet-list formatting). Only touches this one column, only these rows.
//
// Usage (dry run, default):
//   SHEET_ID=... node scripts/sheet-sync/update-descriptions.mjs
// Usage (applies):
//   SHEET_ID=... node scripts/sheet-sync/update-descriptions.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"

const UPDATES = {
  "BIE-BOG-001": "Flotas una hora en agua salada dentro de un tanque de aislamiento sensorial, en total silencio y oscuridad. Después, un espacio de meditación y una bebida caliente prolongan la calma en una sesión de dos horas en total.",
  "EST-COR-001": "Una noche entre montañas, lejos del ruido de la ciudad, en un refugio rodeado de páramo. Las noches son frías, así que te vas abrigado a disfrutar el silencio de la montaña.",
  "EST-COR-002": "Una noche en una cabaña con vista a la montaña, junto a la chimenea y en silencio de campo. A la mañana siguiente, desayunas antes de volver a la ciudad.",
  "GAS-BOG-004": "Un brunch tranquilo en Usaquén, con buena repostería y café, para empezar el día sin afán, entre amigos o en pareja.",
  "GAS-BOG-005": "Una tarde para disfrutar una degustación de pasteles acompañados de un buen café, en un ambiente acogedor de Usaquén.",
  "CUL-BOG-001": "Tienes una sesión de fotos de estudio de 30 minutos, sola, en pareja o con amigos. Al final te llevas 5 fotos con edición básica de color, además de las adicionales que se logren captar durante la sesión.",
  "AVE-COC-001": "Bajas 6 kilómetros por el río Negro en balsa, entre rápidos de nivel I a III. Cruzas después el circuito aéreo de Las Ceibas, con vuelos de hasta 200 metros y un puente colgante sobre el río, y cierras con un rápel de 25 metros por una pared de roca seca.",
  "AVE-COC-002": "Recorres 4 kilómetros en cuatrimoto por los caminos rurales de Útica. Cruzas después el circuito aéreo de Las Ceibas, con vuelos de hasta 200 metros y un puente colgante sobre el río, y cierras con un rápel de 25 metros por una pared de roca seca.",
  "AVE-COC-003": "Recorres en canopy 1.260 metros en posición Superman, hasta 150 metros de altura sobre el valle del río Negro. Bajas después en rápel por una pared de roca seca de 25 metros y cierras con un recorrido de 4 kilómetros en cuatrimoto por los caminos rurales de Útica.",
  "AVE-COC-004": "Bajas 6 kilómetros por el río Negro en balsa, entre rápidos de nivel I a III. Después recorres 4 kilómetros en cuatrimoto por los caminos rurales de Útica.",
  "AVE-COC-005": "Bajas 6 kilómetros por el río Negro en balsa, entre rápidos de nivel I a III. Completas después un rápel de 25 metros por una pared de roca seca, y cierras la jornada con una cabalgata guiada por los caminos rurales de Útica.",
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
  const descCol = header.indexOf("descripcion_corta")
  if (codeCol === -1 || descCol === -1) {
    throw new Error("No encontré las columnas codigo_interno/descripcion_corta en la fila 1.")
  }
  const descLetter = columnLetter(descCol)

  const found = new Set()
  const writes = []

  rows.forEach((row, i) => {
    const code = (row[codeCol] || "").trim()
    if (!UPDATES[code]) return
    found.add(code)
    const sheetRow = i + 2
    const current = row[descCol] || ""
    const next = UPDATES[code]
    console.log(`\n${code} (fila ${sheetRow}, columna ${descLetter})`)
    console.log(`  antes: ${current}`)
    console.log(`  después: ${next}`)
    writes.push({ range: `'${title}'!${descLetter}${sheetRow}`, values: [[next]] })
  })

  const missing = Object.keys(UPDATES).filter((c) => !found.has(c))
  if (missing.length) {
    throw new Error(`No encontré estas filas en el sheet: ${missing.join(", ")}`)
  }

  console.log(`\n${writes.length} filas a actualizar.`)

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
