import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { getSheetData } from "./sheet"
import { parseVisibleBadgeKeys } from "@/data/badges"
import type { Experience } from "@/types/experience"

const categoryMap: Record<string,string> = {
  gastro: "gastronomia",
  bienestar: "bienestar",
  aventura: "aventura",
  cultura: "cultura",
  estancias: "estancias"
}

const PLACEHOLDER_IMAGE = "/images/box-includes/vivabox-caja-regalo.webp"
const LOCAL_CACHE_DIR = path.join(process.cwd(), "public", "images", "experiences")

// codigo_interno -> descriptive slug for public/images/experiencias-reales/.
// Keeps the Sheet's "imagen"/"imagenes_adicionales" columns (still codigo_interno-based,
// per docs on the sheet's "imagen" column) untouched -- this is a presentation-only
// rewrite for SEO-friendly URLs. Add an entry here whenever a new codigo_interno's
// folder gets renamed; codes with no entry just pass through unchanged.
const REAL_PHOTO_SLUGS: Record<string, string> = {
  "AVE-CNO-001": "motocross-tocancipa-vivabox",
  "AVE-CNO-002": "escalada-rocas-suesca-vivabox",
  "AVE-COR-001": "caminata-laguna-ubaque-vivabox",
  "AVE-COR-002": "cabalgata-parrillada-la-calera-vivabox",
  "AVE-COR-003": "cabalgata-montana-la-calera-vivabox",
  "BIE-BOG-001": "flotacion-tanque-sensorial-bogota-vivabox",
  "EST-CNO-001": "domo-glamping-suesca-vivabox",
  "EST-COR-001": "refugio-montana-choachi-vivabox",
  "EST-COR-002": "cabana-montana-choachi-vivabox",
  "GAS-BOG-001": "cena-carnes-bogota-vivabox",
  "GAS-BOG-002": "cena-colombiana-bogota-vivabox",
  "GAS-BOG-003": "taller-cata-cacao-bogota-vivabox",
  "GAS-BOG-004": "brunch-bogota-vivabox",
  "GAS-BOG-005": "pasteles-cafe-bogota-vivabox",
  "GAS-CNO-001": "taller-sushi-pacho-vivabox",
}

// Rewrites /images/experiencias-reales/{codigo_interno}/{n}.webp to the
// renamed /images/experiencias-reales/{slug}/{slug}-{n}.webp path, if a
// mapping exists. Falls through unchanged otherwise (unmapped code, or an
// already-slugged path).
function resolveRealPhotoSlug(url: string): string {
  const match = url.match(/^\/images\/experiencias-reales\/([^/]+)\/(\d+)\.webp$/)
  if (!match) return url

  const [, codigoInterno, n] = match
  const slug = REAL_PHOTO_SLUGS[codigoInterno]
  if (!slug) return url

  return `/images/experiencias-reales/${slug}/${slug}-${n}.webp`
}

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

// Real photos committed to public/images/experiencias-reales/. The Sheet's "imagen"
// column (see its docs) still stores the codigo_interno-based path; REAL_PHOTO_SLUGS
// above rewrites it to the renamed folder for any code that's been migrated.
function isLocalExperienceImage(url?: string): url is string {
  return !!url && url.startsWith("/images/experiencias-reales/")
}

// Must stay in sync with localFileNameFor() in scripts/cache-experience-images.mjs
function resolveExperienceImage(url?: string): string {
  if (isLocalExperienceImage(url)) return resolveRealPhotoSlug(url)
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

    grouped[cat] = shuffled.slice(0,2).map(row => ({

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