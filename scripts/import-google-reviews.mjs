// Importación puntual de reseñas de Google (4-5 estrellas, con texto) a la
// tabla google_reviews. Idempotente: re-ejecutarlo no duplica filas.
// Requiere SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY de .env.local.
//
// Usage:
//   node --env-file=.env.local scripts/import-google-reviews.mjs
//
// Para añadir reseñas nuevas, agrégalas a REVIEWS y vuelve a ejecutarlo.
// review_date: Google solo da fechas relativas ("hace un mes"), son aproximadas.

import { createClient } from "@supabase/supabase-js"

const REVIEWS = [
  {
    author_name: "Bat Say",
    rating: 5,
    review_date: "2026-10-12",
    text: "Una maravilla, super organizado y con una oferta espectacular de experiencias para hacer en Bogotá y sus alrededores. Me gustó que tuvieran una app y página tan conveniente para la selección de las actividades. Los organizadores, además, super buena onda!\n\nProbé la experiencia de paseo en velero y quedé encantada. Gracias :)",
  },
  {
    author_name: "Margarita Jarava",
    rating: 5,
    review_date: "2026-11-10",
    text: "Vivabox es una opción espectacular de regalo para nuestros seres queridos o incluso para los colaboradores de las empresas, han elegido sus experiencias de forma muy acertada ofreciendo opciones increíbles. Su equipo super amable, los recomiendo 100%",
  },
]

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  throw new Error(
    "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants — lance avec: node --env-file=.env.local scripts/import-google-reviews.mjs"
  )
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

const rows = REVIEWS.filter((r) => r.rating >= 4 && r.text.trim()).map((r) => ({
  ...r,
  source: "google",
  is_visible: true,
}))

const { data, error } = await supabase
  .from("google_reviews")
  .upsert(rows, { onConflict: "source,author_name,text", ignoreDuplicates: true })
  .select("id")

if (error) {
  console.error("Error:", error.message)
  process.exit(1)
}
console.log(`OK — ${data.length} reseña(s) nueva(s) insertada(s) (${rows.length - data.length} ya existían).`)
