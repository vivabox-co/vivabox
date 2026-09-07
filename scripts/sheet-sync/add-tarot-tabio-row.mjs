// Adds the new "Tarde de tarot con café y torta" (BIE-CNO-001, Tabio) row to
// the Experiencias sheet, into the first fully blank pre-formatted row.
//
// Usage (dry run, default):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/add-tarot-tabio-row.mjs
// Usage (applies the change):
//   SHEET_ID=<spreadsheet id> node scripts/sheet-sync/add-tarot-tabio-row.mjs --confirm

import { getSheetsClient } from "./client.mjs"

const DEFAULT_GID = "1700161859"

const ROW = {
  codigo_interno: "BIE-CNO-001",
  nombre_experiencia: "Tarde de tarot con café y torta",
  categoria: "bienestar",
  tipo_actividad: "tarot",
  ciudad: "Tabio",
  zona: "Cundinamarca",
  proveedor_nombre: "María Belén Tarot",
  proveedor_contacto: "Belén",
  proveedor_telefono: "350 643 4301",
  proveedor_instagram: "@mariabelentarot",
  duracion_min: "1:00",
  formato: "solo o duo",
  descripcion_corta:
    "Una lectura de tarot de una hora, pensada para vivirla sola o acompañada, en un espacio tranquilo del pueblo de Tabio. Mientras se leen las cartas, hay café, aromática o avena, y un amasijo o torta de chocolate para acompañar la tarde.",
  nota_vivabox:
    "La incluimos porque combina algo poco común en el catálogo: una lectura de tarot con tiempo para tomar algo caliente y comer despacio, sin sentirse una consulta exprés.",
  incluye: "Café, aromática o avena, y amasijo o torta de chocolate",
  nivel_esfuerzo: "bajo",
  imagen:
    "/images/experiencias-reales/lectura-tarot-tabio-vivabox/lectura-tarot-tabio-vivabox-1.webp",
  imagenes_adicionales:
    "/images/experiencias-reales/lectura-tarot-tabio-vivabox/lectura-tarot-tabio-vivabox-2.webp|/images/experiencias-reales/lectura-tarot-tabio-vivabox/lectura-tarot-tabio-vivabox-3.webp",
  claves_eleccion: "Café y torta incluidos",
  requiere_telefono: "FALSE",
  requiere_num_personas: "TRUE",
  estado: "borrador",
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

  const existing = rows.findIndex((r) => (r[codeCol] || "").trim() === ROW.codigo_interno)
  if (existing !== -1) {
    throw new Error(`Ya existe una fila con ${ROW.codigo_interno} en la fila ${existing + 2}. Abortando.`)
  }

  const blankRowIndex = rows.findIndex((r) => !(r[codeCol] || "").trim())
  if (blankRowIndex === -1) {
    throw new Error("No encontré ninguna fila en blanco pre-formateada para escribir.")
  }
  const sheetRow = blankRowIndex + 2

  console.log(`Pestaña "${title}": se escribirá en la fila ${sheetRow} (primera fila en blanco).`)
  console.log(`Campos a escribir (${Object.keys(ROW).length}):`)

  const valueRanges = []
  for (const [field, value] of Object.entries(ROW)) {
    const colIndex = header.indexOf(field)
    if (colIndex === -1) {
      console.log(`  AVISO: columna "${field}" no existe, la salto`)
      continue
    }
    console.log(`  ${field}: ${JSON.stringify(value).slice(0, 120)}`)
    valueRanges.push({
      range: `'${title}'!${columnLetter(colIndex)}${sheetRow}`,
      values: [[value]],
    })
  }

  if (!confirm) {
    console.log("\nDry run -- no se escribió nada. Vuelve a correr con --confirm para aplicar.")
    return
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "RAW", data: valueRanges },
  })

  console.log(`\nListo. Fila ${sheetRow} escrita.`)
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

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
