// Wires up the webp photos converted into public/images/experiencias-reales/
// for the 12 newly-added rows (see update-12-new-rows.mjs) and marks them
// ready to publish. GAS-COR-001 has no photos yet, so it's skipped.
//
// Usage: SHEET_ID=... node scripts/sheet-sync/add-photos-12-new-rows.mjs [--confirm]

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"

const PHOTOS = {
  "BIE-COR-001": { slug: "termales-masaje-coctel-la-calera-vivabox", count: 3 },
  "BIE-COR-002": { slug: "termales-hidratacion-facial-la-calera-vivabox", count: 3 },
  "BIE-COR-003": { slug: "spa-termal-natural-la-calera-vivabox", count: 3 },
  "BIE-COR-004": { slug: "masaje-almuerzo-gourmet-la-calera-vivabox", count: 2 },
  "BIE-COR-005": { slug: "hospedaje-termales-nocturnas-la-calera-vivabox", count: 3 },
  "BIE-COR-006": { slug: "parrillada-carpa-privada-la-calera-vivabox", count: 3 },
  "CUL-BOG-009": { slug: "recorrido-barrio-egipto-bogota-vivabox", count: 3 },
  "AVE-BOG-002": { slug: "tiro-poligono-bogota-vivabox", count: 3 },
  "AVE-BOG-003": { slug: "tiro-poligono-suesca-vivabox", count: 3 },
  "AVE-BOG-004": { slug: "tunel-gravedad-bogota-vivabox", count: 3 },
  "GAS-BOG-008": { slug: "almuerzo-cena-candelaria-bogota-vivabox", count: 3 },
}

function buildFields({ slug, count }) {
  const path = (n) => `/images/experiencias-reales/${slug}/${slug}-${n}.webp`
  const extras = Array.from({ length: count - 1 }, (_, i) => path(i + 2))
  return {
    imagen: path(1),
    imagenes_adicionales: extras.join("|"),
    estado: "listo para publicar",
  }
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

  const valueRanges = []
  let cellCount = 0

  for (const [code, photoInfo] of Object.entries(PHOTOS)) {
    const rowIndex = rows.findIndex((r) => (r[codeCol] || "").trim() === code)
    if (rowIndex === -1) {
      console.log(`AVISO: no encontré ${code}, la salto`)
      continue
    }
    const sheetRow = rowIndex + 2
    const fields = buildFields(photoInfo)
    console.log(`\n${code} (fila ${sheetRow})`)
    for (const [field, newValue] of Object.entries(fields)) {
      const colIndex = header.indexOf(field)
      if (colIndex === -1) {
        console.log(`  AVISO: columna "${field}" no existe, la salto`)
        continue
      }
      const current = rows[rowIndex][colIndex] || ""
      if (current.trim() === newValue.trim()) continue
      const col = columnLetter(colIndex)
      console.log(`  ${field}:`)
      console.log(`    antes:    ${JSON.stringify(current).slice(0, 150)}`)
      console.log(`    después:  ${JSON.stringify(newValue).slice(0, 150)}`)
      valueRanges.push({ range: `'${title}'!${col}${sheetRow}`, values: [[newValue]] })
      cellCount++
    }
  }

  console.log(`\n${cellCount} celdas para actualizar.`)

  if (!confirm) {
    console.log("\nDry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  if (valueRanges.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: "RAW", data: valueRanges },
    })
  }

  console.log("\nListo.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
