import Papa from "papaparse"

const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vS0wvZlSud-v8_n6IWeI6_qfWgmuViBjkp1-yHP-RJ90VlxhistJE2MuV0k_jc88cUeyOngtBI3ZdWM/pub?gid=1700161859&single=true&output=csv"

// Rows count as live once they're finalized ("listo para publicar") or fully
// live ("publicado") -- everything else (borrador, en validación...) stays
// hidden. The sheet also has a large block of fully blank rows (pre-formatted
// for future entries), which codigo_interno being empty catches too.
const PUBLISHED_STATES = new Set(["publicado", "listo para publicar"])

// The published sheet's real column headers are in Spanish. This map is the only
// place that needs to know that -- everything downstream (services/experiences.ts,
// data/categories.ts, ExperienceModal...) keeps reading the English keys it always has.
const HEADER_MAP: Record<string, string> = {
  nombre_experiencia: "title",
  categoria: "category",
  ciudad: "city",
  zona: "zone",
  duracion_min: "duration",
  formato: "format",
  imagen: "image",
  descripcion_corta: "shortDescription",
  ideal_para: "idealFor",
  nivel_esfuerzo: "effortLevel",
  ambiente_animo: "ambiance",
  entorno: "environment",
  ritmo: "engagement",
  nota_vivabox: "vivanote",
  imagenes_adicionales: "imagenesAdicionales",
  claves_eleccion: "visibleBadges",
}

function translateRow(row: Record<string, string>) {
  const translated: Record<string, string> = {}
  for (const [key, value] of Object.entries(row)) {
    translated[HEADER_MAP[key] || key] = value
  }
  return translated
}

export async function getSheetData() {

  const res = await fetch(SHEET_URL, {
    next: { revalidate: 3600 } // refresh every hour
  })

  const csv = await res.text()

  const { data } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true
  })

  return (data as Record<string, string>[])
    .map(translateRow)
    .filter((row) =>
      row.codigo_interno && PUBLISHED_STATES.has((row.estado || "").trim().toLowerCase())
    )
}