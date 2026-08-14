import type { LucideIcon } from "lucide-react"
import {
  Utensils,
  Heart,
  Sun,
  Clock,
  Leaf,
  Sparkles,
  Smile,
  Mountain,
  Wind,
  Footprints,
  Palette,
  BookOpen,
  Users,
  Bed,
  Coffee,
  Moon,
  Zap,
  Home,
  Flame,
} from "lucide-react"

// Colors per docs/01_product.md — Experience Categories table
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  gastronomia: { bg: "bg-amber-500", text: "text-white", dot: "bg-amber-500" },
  bienestar: { bg: "bg-blue-500", text: "text-white", dot: "bg-blue-500" },
  aventura: { bg: "bg-red-500", text: "text-white", dot: "bg-red-500" },
  cultura: { bg: "bg-violet-500", text: "text-white", dot: "bg-violet-500" },
  estancias: { bg: "bg-green-500", text: "text-white", dot: "bg-green-500" },
}

export const DEFAULT_CATEGORY_COLOR = { bg: "bg-gray-500", text: "text-white", dot: "bg-gray-300" }

// Emotional, feeling-first descriptions per category — answers "¿qué se siente vivir esta experiencia?"
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  gastronomia: "Café de especialidad, pan recién horneado y una mañana para disfrutar sin afán.",
  bienestar: "Un momento para desconectar, respirar profundo y dedicarte tiempo a ti.",
  aventura: "Respira aire puro, sal de la rutina y crea recuerdos que querrás repetir.",
  cultura: "Descubre lugares, historias y personas que hacen única cada ciudad.",
  estancias: "Una pausa para cambiar de ritmo y disfrutar otro paisaje.",
}

export const DEFAULT_CATEGORY_DESCRIPTION =
  "Un momento pensado para disfrutar y crear un recuerdo distinto."

// Scannable feature row per category — icon + short label, understood in under 3 seconds
export type CategoryFeature = { icon: LucideIcon; label: string }

export const CATEGORY_FEATURES: Record<string, CategoryFeature[]> = {
  gastronomia: [
    { icon: Utensils, label: "Sabores" },
    { icon: Heart, label: "Compartir" },
    { icon: Sun, label: "Ambiente relajado" },
    { icon: Clock, label: "2–3 horas" },
  ],
  bienestar: [
    { icon: Leaf, label: "Bienestar" },
    { icon: Sparkles, label: "Cuidado personal" },
    { icon: Smile, label: "Desconexión" },
    { icon: Clock, label: "60–90 min" },
  ],
  aventura: [
    { icon: Mountain, label: "Adrenalina" },
    { icon: Wind, label: "Aire libre" },
    { icon: Footprints, label: "Movimiento" },
    { icon: Clock, label: "2–4 horas" },
  ],
  cultura: [
    { icon: Palette, label: "Arte" },
    { icon: BookOpen, label: "Historia" },
    { icon: Users, label: "Comunidad" },
    { icon: Clock, label: "2–3 horas" },
  ],
  estancias: [
    { icon: Leaf, label: "Naturaleza" },
    { icon: Bed, label: "Descanso" },
    { icon: Coffee, label: "Desconexión" },
    { icon: Moon, label: "1–2 noches" },
  ],
}

export const DEFAULT_CATEGORY_FEATURES: CategoryFeature[] = [
  { icon: Heart, label: "Único" },
  { icon: Sun, label: "Ambiente" },
  { icon: Smile, label: "Disfrute" },
  { icon: Clock, label: "Duración variable" },
]

// Curated, human explanation of why this category represents the Vivabox philosophy
export const CATEGORY_WHY_VIVABOX: Record<string, string> = {
  gastronomia: "Porque reúne buena comida y tiempo de calidad alrededor de la mesa.",
  bienestar: "Porque regala un espacio para desconectar y cuidar de ti mismo.",
  aventura: "Porque invita a salir de la rutina y vivir un momento que vale la pena recordar.",
  cultura: "Porque acerca historias y lugares que hacen memorable cada visita.",
  estancias: "Porque combina naturaleza, descanso y bienestar en un entorno ideal para desconectar.",
}

export const DEFAULT_WHY_VIVABOX =
  "Porque invita a regalar un momento que vale la pena recordar."

// Per-experience highlight badges, derived from the sheet's real ambiance /
// environment / engagement fields instead of a fixed set per category — two
// experiences in the same category can (and usually do) get different badges.
const AMBIANCE_HIGHLIGHT: Record<string, CategoryFeature> = {
  "relax": { icon: Leaf, label: "Relax" },
  "adrenalina": { icon: Zap, label: "Adrenalina" },
  "social": { icon: Users, label: "Para compartir" },
  "romántico": { icon: Heart, label: "Ambiente íntimo" },
  "cultural": { icon: Palette, label: "Cultural" },
}

const ENVIRONMENT_HIGHLIGHT: Record<string, CategoryFeature> = {
  "indoor": { icon: Home, label: "Bajo techo" },
  "outdoor": { icon: Wind, label: "Aire libre" },
}

const ENGAGEMENT_HIGHLIGHT: Record<string, CategoryFeature> = {
  "relajado": { icon: Moon, label: "Ritmo tranquilo" },
  "activo": { icon: Footprints, label: "Ritmo activo" },
  "sacudido": { icon: Flame, label: "Alta energía" },
}

function firstToken(value?: string): string {
  return (value || "").split(",")[0].trim().toLowerCase()
}

// Builds up to 3 unique, experience-specific highlights. Falls back to the
// category defaults when the sheet doesn't have enough real data to work with.
export function getExperienceHighlights(experience: {
  category?: string
  ambiance?: string
  environment?: string
  engagement?: string
}): CategoryFeature[] {

  const highlights: CategoryFeature[] = []

  const ambiance = AMBIANCE_HIGHLIGHT[firstToken(experience.ambiance)]
  const environment = ENVIRONMENT_HIGHLIGHT[firstToken(experience.environment)]
  const engagement = ENGAGEMENT_HIGHLIGHT[firstToken(experience.engagement)]

  if (ambiance) highlights.push(ambiance)
  if (environment) highlights.push(environment)
  if (engagement) highlights.push(engagement)

  if (highlights.length >= 3) return highlights

  const categoryKey = experience.category?.toLowerCase() || ""
  const fallback = CATEGORY_FEATURES[categoryKey] || DEFAULT_CATEGORY_FEATURES

  for (const feature of fallback) {
    if (highlights.length >= 3) break
    if (!highlights.some((h) => h.label === feature.label)) {
      highlights.push(feature)
    }
  }

  return highlights
}

// Formats the sheet's raw duration (minutes, as a string) into a compact label.
export function formatDuration(duration?: string): string | null {

  const minutes = Number(duration)
  if (!duration || Number.isNaN(minutes) || minutes <= 0) return null

  if (minutes < 60) return `${minutes} min`

  const hours = minutes / 60
  const label = Number.isInteger(hours) ? `${hours}` : hours.toFixed(1)

  return `${label} h`
}
