// Fuente del trigger onEdit que auto-genera codigo_interno en la pestaña
// "Experiencias". Este archivo es la fuente de verdad versionada en git --
// se despliega al proyecto Apps Script vinculado al sheet vía
// push-apps-script.mjs, no se edita a mano en el editor de Apps Script.
//
// Logica: cuando nombre_experiencia + categoria + ciudad quedan completos en
// una fila y codigo_interno sigue vacío, calcula el siguiente CAT-CIUDAD-000
// y lo escribe. Nunca pisa un codigo_interno ya existente.

const SHEET_NAME = 'Experiencias'

const COL = { CODIGO: 1, NOMBRE: 2, CATEGORIA: 3, CIUDAD: 5 } // A, B, C, E

const CATEGORIA_ABBR = {
  'gastro': 'GAS',
  'bienestar': 'BIE',
  'aventura': 'AVE',
  'cultura': 'CUL',
  'estancias': 'EST',
}

// Ciudad (texto real de la columna, normalizado) -> zona usada en el codigo_interno.
// Agregar aquí cualquier ciudad nueva que aparezca y no esté todavía.
const CIUDAD_ZONA = {
  'bogota d.c.': 'BOG',
  'bogota': 'BOG',
  'tocancipa': 'CNO',
  'suesca': 'CNO',
  'pacho': 'CNO',
  'choachi': 'COR',
  'la calera': 'COR',
  'guatavita': 'COR',
  'utica': 'COC',
  'tobia': 'COC',
}

function normalizar(s) {
  return String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- simple trigger, called by Google Sheets
function onEdit(e) {
  try {
    const sheet = e.range.getSheet()
    if (sheet.getName() !== SHEET_NAME) return

    const row = e.range.getRow()
    if (row === 1) return

    const editedCol = e.range.getColumn()
    const numCols = e.range.getNumColumns()
    const tocaColumnasClave = [COL.NOMBRE, COL.CATEGORIA, COL.CIUDAD].some(
      (c) => c >= editedCol && c < editedCol + numCols
    )
    if (!tocaColumnasClave) return

    const valores = sheet.getRange(row, 1, 1, 5).getValues()[0]
    const codigoActual = String(valores[COL.CODIGO - 1] || '').trim()
    if (codigoActual) return

    const nombre = String(valores[COL.NOMBRE - 1] || '').trim()
    const categoria = normalizar(valores[COL.CATEGORIA - 1])
    const ciudad = normalizar(valores[COL.CIUDAD - 1])
    if (!nombre || !categoria || !ciudad) return

    const catAbbr = CATEGORIA_ABBR[categoria]
    const ciudadAbbr = CIUDAD_ZONA[ciudad]

    if (!catAbbr || !ciudadAbbr) {
      sheet.getRange(row, COL.CODIGO).setNote(
        !catAbbr
          ? 'No se pudo generar codigo_interno: categoría no reconocida.'
          : 'No se pudo generar codigo_interno: ciudad no está en la tabla CIUDAD_ZONA del script. Agrégala y vuelve a editar la fila.'
      )
      return
    }

    const prefix = catAbbr + '-' + ciudadAbbr + '-'
    const numero = getNextSequential(sheet, prefix)
    sheet.getRange(row, COL.CODIGO).setValue(prefix + String(numero).padStart(3, '0')).setNote(null)
  } catch (err) {
    console.error(err)
  }
}

function getNextSequential(sheet, prefix) {
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return 1
  const codigos = sheet.getRange(2, COL.CODIGO, lastRow - 1, 1).getValues().flat()
  let max = 0
  codigos.forEach((c) => {
    const s = String(c || '').trim()
    if (s.indexOf(prefix) === 0) {
      const n = parseInt(s.substring(prefix.length), 10)
      if (!isNaN(n) && n > max) max = n
    }
  })
  return max + 1
}
