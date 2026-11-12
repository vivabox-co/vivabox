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

// Enlace a la pestaña de reseñas de la ficha de Google Maps. Sustituible por el
// enlace exacto de cada reseña (campo source_url) cuando se tenga.
const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/place/Vivabox+Colombia/@4.7824956,-73.970706,17z/data=!4m8!3m7!1s0x8e3f999b98077ee5:0x877f1cb2c5b62e09!8m2!3d4.7824956!4d-73.970706!9m1!1b1!16s%2Fg%2F11nvgzsvzd"

const REVIEWS = [
  {
    author_name: "Bat Say",
    rating: 5,
    review_date: "2026-10-12",
    source_url: GOOGLE_REVIEWS_URL,
    text: "Una maravilla, super organizado y con una oferta espectacular de experiencias para hacer en Bogotá y sus alrededores. Me gustó que tuvieran una app y página tan conveniente para la selección de las actividades. Los organizadores, además, super buena onda!\n\nProbé la experiencia de paseo en velero y quedé encantada. Gracias :)",
  },
  {
    author_name: "Margarita Jarava",
    rating: 5,
    review_date: "2026-11-10",
    source_url: GOOGLE_REVIEWS_URL,
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
// Las filas ya existentes no se tocan (ignoreDuplicates), así que el enlace se
// actualiza aparte, sin pisar is_visible.
for (const r of rows) {
  if (!r.source_url) continue
  const { error: e } = await supabase
    .from("google_reviews")
    .update({ source_url: r.source_url })
    .match({ source: r.source, author_name: r.author_name, text: r.text })
  if (e) {
    console.error("Error (source_url):", e.message)
    process.exit(1)
  }
}
console.log(`OK — ${data.length} reseña(s) nueva(s) insertada(s) (${rows.length - data.length} ya existían).`)
