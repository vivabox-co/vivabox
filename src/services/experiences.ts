import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { getSheetData } from "./sheet"
import { parseVisibleBadgeKeys } from "@/data/badges"
import { interleaveByOrder, SHOWCASE_CATEGORY_ORDER } from "@/utils/interleave"
import { formatCity } from "@/data/categories"
import type { ExperienceSchemaItem } from "@/data/boxSchema"
import type { Experience } from "@/types/experience"
import { categoryOrder, normalizeActivityKey, type MapCategory, type MapExperience } from "@/features/app-map/config"

const categoryMap: Record<string,string> = {
  gastro: "gastronomia",
  bienestar: "bienestar",
  aventura: "aventura",
  cultura: "cultura",
  estancias: "estancias"
}

const PLACEHOLDER_IMAGE = "/images/box-includes/vivabox-caja-regalo.webp"
const LOCAL_CACHE_DIR = path.join(process.cwd(), "public", "images", "experiences")

// Minimum photos per gallery so the modal always shows a real carousel.
// Rows without enough "imagenes_adicionales" get padded with generic
// experience shots -- relevance doesn't matter here, just variety.
const MIN_GALLERY_IMAGES = 3
const FALLBACK_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1560275619-4662e36fa65c",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
]

function isRemoteExperienceImage(url?: string): url is string {
  return !!url && (url.includes("images.pexels.com") || url.includes("images.unsplash.com"))
}

// Real photos committed to public/images/experiencias-reales/, named with a
// descriptive slug (see docs on the sheet's "imagen" column).
function isLocalExperienceImage(url?: string): url is string {
  return !!url && url.startsWith("/images/experiencias-reales/")
}

// Must stay in sync with localFileNameFor() in scripts/cache-experience-images.mjs
function resolveExperienceImage(url?: string): string {
  if (isLocalExperienceImage(url)) return url
  if (!isRemoteExperienceImage(url)) return PLACEHOLDER_IMAGE

  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 16)
  const localPath = path.join(LOCAL_CACHE_DIR, `${hash}.webp`)

  return fs.existsSync(localPath) ? `/images/experiences/${hash}.webp` : url
}

function shuffle<T>(array:T[]):T[] {
  return [...array].sort(() => Math.random() - 0.5)
}

// Cover photo first, then whatever's listed in the sheet's "imagenes_adicionales"
// column (pipe-separated) -- each one resolved the same way as the cover.
function resolveGallery(row: any): string[] {
  const additional: string[] = (row.imagenesAdicionales || "")
    .split("|")
    .map((s: string) => s.trim())
    .filter(Boolean)
    .map(resolveExperienceImage)

  const gallery = [resolveExperienceImage(row.image), ...additional]

  for (let i = 0; gallery.length < MIN_GALLERY_IMAGES && i < FALLBACK_GALLERY_IMAGES.length; i++) {
    const fallback = resolveExperienceImage(FALLBACK_GALLERY_IMAGES[i])
    if (!gallery.includes(fallback)) gallery.push(fallback)
  }

  return gallery
}

// The homepage is statically cached (ISR), so the per-visit shuffle can't run
// on the server any more. This returns a small pool per category (itself
// reshuffled at every regeneration); ExperiencesGrid shows 2 per category
// and re-picks them in the browser.
export const PREVIEW_POOL_PER_CATEGORY = 3

export async function getExperiencesPreview():Promise<Experience[]> {

  const rows:any[] = await getSheetData()

  const categories = [
    "gastronomia",
    "bienestar",
    "aventura",
    "cultura",
    "estancias"
  ]

  const grouped:Record<string,Experience[]> = {}

  for(const cat of categories){

    const activities = rows.filter(
      r => categoryMap[r.category?.toLowerCase()] === cat
    )

    const shuffled = shuffle(activities)

    grouped[cat] = shuffled.slice(0,PREVIEW_POOL_PER_CATEGORY).map(row => ({

      title: row.title,
      city: row.city,
      category: cat,
      image: resolveExperienceImage(row.image),
      gallery: resolveGallery(row),

      duration: row.duration,
      zone: row.zone,
      format: row.format,
      shortDescription: row.shortDescription,

      idealFor: row.idealFor,
      effortLevel: row.effortLevel,
      ambiance: row.ambiance,
      environment: row.environment,
      engagement: row.engagement,
      vivanote: row.vivanote,

      visibleBadges: parseVisibleBadgeKeys(row.visibleBadges)

    }))
  }

  const ordered:Experience[] = []

  for(let i=0;i<PREVIEW_POOL_PER_CATEGORY;i++){
    for(const cat of categories){
      if(grouped[cat]?.[i]){
        ordered.push(grouped[cat][i])
      }
    }
  }

  return ordered
}

// Two experiences per category, for the product page's "algunas experiencias
// que podría elegir" section. Only 4 categories (per docs/08_product-page.md)
// to keep the section shorter than the homepage's -- "cultura" intentionally
// left out.
export async function getExperienceExamples():Promise<Experience[]> {

  const rows:any[] = await getSheetData()

  const categories = [
    "gastronomia",
    "bienestar",
    "aventura",
    "estancias"
  ]

  const grouped:Record<string,Experience[]> = {}

  for(const cat of categories){

    const activities = rows.filter(
      r => categoryMap[r.category?.toLowerCase()] === cat
    )

    grouped[cat] = shuffle(activities).slice(0,2).map(row => ({
      title: row.title,
      city: row.city,
      category: cat,
      image: resolveExperienceImage(row.image),
      gallery: resolveGallery(row),

      duration: row.duration,
      zone: row.zone,
      format: row.format,
      shortDescription: row.shortDescription,

      idealFor: row.idealFor,
      effortLevel: row.effortLevel,
      ambiance: row.ambiance,
      environment: row.environment,
      engagement: row.engagement,
      vivanote: row.vivanote,

      visibleBadges: parseVisibleBadgeKeys(row.visibleBadges)
    }))
  }

  const ordered:Experience[] = []

  for(let i=0;i<2;i++){
    for(const cat of categories){
      if(grouped[cat]?.[i]){
        ordered.push(grouped[cat][i])
      }
    }
  }

  return ordered
}

// Every published experience across all 5 categories, interleaved so
// consecutive items rarely share a category. Used by the internal
// /experience-showcase production tool (not linked from the live site) --
// no gallery resolution here since that page never opens the modal.
export async function getAllExperiences(): Promise<Experience[]> {

  const rows: any[] = await getSheetData()

  const categories = [
    "gastronomia",
    "bienestar",
    "aventura",
    "cultura",
    "estancias"
  ]

  const grouped: Record<string, Experience[]> = {}

  for (const cat of categories) {

    const activities = rows.filter(
      r => categoryMap[r.category?.toLowerCase()] === cat
    )

    grouped[cat] = shuffle(activities).map(row => ({
      title: row.title,
      city: row.city,
      category: cat,
      image: resolveExperienceImage(row.image),

      duration: row.duration,
      zone: row.zone,
      format: row.format,
      shortDescription: row.shortDescription,

      idealFor: row.idealFor,
      effortLevel: row.effortLevel,
      ambiance: row.ambiance,
      environment: row.environment,
      engagement: row.engagement,
      vivanote: row.vivanote,

      visibleBadges: parseVisibleBadgeKeys(row.visibleBadges)
    }))
  }

  return interleaveByOrder(grouped, SHOWCASE_CATEGORY_ORDER)
}

const SCHEMA_CATEGORY_LABELS: Record<string, string> = {
  gastro: "Gastronomía",
  bienestar: "Bienestar",
  aventura: "Aventura",
  cultura: "Cultura",
  estancias: "Estancias",
}

// Every published experience for the SEO/GEO structured data (JSON-LD only,
// never rendered). Stable order (category, then sheet order) and deduped by
// title + city, so crawlers always see the same complete list.
export async function getExperienceSchemaItems(): Promise<ExperienceSchemaItem[]> {

  const rows: any[] = await getSheetData()
  const seen = new Set<string>()
  const items: ExperienceSchemaItem[] = []

  for (const row of rows) {
    const key = String(row.category || "").trim().toLowerCase()
    const title = String(row.title || "").trim()
    const label = SCHEMA_CATEGORY_LABELS[key]

    if (!title || !label || !row.codigo_interno) continue

    const city = formatCity(row.city)
    const dedupeKey = `${title.toLowerCase()}|${(city || "").toLowerCase()}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    items.push({
      title,
      city,
      categoryLabel: label,
      description: String(row.shortDescription || "").trim() || undefined,
    })
  }

  const order = Object.keys(SCHEMA_CATEGORY_LABELS).map((k) => SCHEMA_CATEGORY_LABELS[k])
  return items.sort((a, b) => order.indexOf(a.categoryLabel) - order.indexOf(b.categoryLabel))
}

// Every published experience that has valid coordinates, in the compact shape
// the homepage's phone map needs (same fields the beneficiary app's map reads).
// Provider names, prices and exact addresses are deliberately not included.
export async function getMapExperiences(): Promise<MapExperience[]> {

  const rows: any[] = await getSheetData()
  const result: MapExperience[] = []

  for (const row of rows) {
    const category = String(row.category || "").trim().toLowerCase() as MapCategory
    const lat = Number(String(row.ubicacion_lat ?? "").replace(",", "."))
    const lng = Number(String(row.ubicacion_lng ?? "").replace(",", "."))

    if (!row.codigo_interno || !categoryOrder.includes(category) || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue
    }

    result.push({
      id: String(row.codigo_interno).trim(),
      title: row.title,
      category,
      activityKey: normalizeActivityKey(row.tipo_actividad),
      lat,
      lng,
      city: row.city || row.zone || "",
      format: String(row.format || "").trim().toLowerCase(),
      photos: resolveGallery(row),
    })
  }

  return result
}
