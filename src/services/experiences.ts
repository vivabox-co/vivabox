import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { getSheetData } from "./sheet"
import type { Experience } from "@/types/experience"

const categoryMap: Record<string,string> = {
  gastro: "gastronomia",
  bienestar: "bienestar",
  aventura: "aventura",
  cultura: "cultura",
  estancias: "estancias"
}

const PLACEHOLDER_IMAGE = "/images/box-includes/vivabox-caja-regalo.png"
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

// Real photos committed to public/images/experiencias-reales/, named after codigo_interno
// (see docs on the sheet's "imagen" column).
function isLocalExperienceImage(url?: string): url is string {
  return !!url && url.startsWith("/images/experiencias-reales/")
}

// Must stay in sync with localFileNameFor() in scripts/cache-experience-images.mjs
function resolveExperienceImage(url?: string): string {
  if (isLocalExperienceImage(url)) return url
  if (!isRemoteExperienceImage(url)) return PLACEHOLDER_IMAGE

  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 16)
  const ext = path.extname(new URL(url).pathname) || ".jpg"
  const localPath = path.join(LOCAL_CACHE_DIR, `${hash}${ext}`)

  return fs.existsSync(localPath) ? `/images/experiences/${hash}${ext}` : url
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
      shortDescription: row.shortDescription,

      idealFor: row.idealFor,
      effortLevel: row.effortLevel,
      ambiance: row.ambiance,
      environment: row.environment,
      engagement: row.engagement,
      vivanote: row.vivanote

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
      shortDescription: row.shortDescription,

      idealFor: row.idealFor,
      effortLevel: row.effortLevel,
      ambiance: row.ambiance,
      environment: row.environment,
      engagement: row.engagement,
      vivanote: row.vivanote
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