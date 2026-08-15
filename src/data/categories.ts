// Colors per docs/01_product.md — Experience Categories table
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string; icon: string }> = {
  gastronomia: { bg: "bg-primary", text: "text-white", dot: "bg-primary", icon: "text-primary" },
  bienestar: { bg: "bg-accent-blue", text: "text-white", dot: "bg-accent-blue", icon: "text-accent-blue" },
  aventura: { bg: "bg-accent-red", text: "text-white", dot: "bg-accent-red", icon: "text-accent-red" },
  cultura: { bg: "bg-violet-500", text: "text-white", dot: "bg-violet-500", icon: "text-violet-500" },
  estancias: { bg: "bg-accent-green", text: "text-white", dot: "bg-accent-green", icon: "text-accent-green" },
}

export const DEFAULT_CATEGORY_COLOR = { bg: "bg-gray-500", text: "text-white", dot: "bg-gray-300", icon: "text-gray-500" }

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

// "duracion_min" is a Sheets cell formatted as Duration, so the published CSV
// holds "H:MM" or "H:MM:SS" (e.g. "2:00", "0:45") instead of a plain number.
// Still falls back to parsing a plain number for any row not yet converted.
function parseDurationMinutes(duration: string): number {
  const hhmm = duration.match(/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/)
  if (!hhmm) return Number(duration)

  const [, hours, minutes, seconds] = hhmm
  return Math.round(Number(hours) * 60 + Number(minutes) + (seconds ? Number(seconds) / 60 : 0))
}

// Formats the sheet's raw duration into a compact label.
export function formatDuration(duration?: string): string | null {

  if (!duration) return null
  const minutes = parseDurationMinutes(duration)
  if (Number.isNaN(minutes) || minutes <= 0) return null

  if (minutes < 60) return `${minutes} min`

  if (minutes % 1440 === 0) {
    const nights = minutes / 1440
    return `${nights} noche${nights > 1 ? "s" : ""}`
  }

  const hours = minutes / 60
  const label = Number.isInteger(hours) ? `${hours}` : hours.toFixed(1)

  return `${label} h`
}

// Sheet's "formato" column: solo | duo -- every experience today is for 1 or 2 people.
export function formatPeopleCount(format?: string): string | null {
  const key = (format || "").trim().toLowerCase()

  if (key === "solo") return "1 persona"
  if (key === "duo") return "2 personas"

  return null
}

// Sheet's "ciudad" column stores Bogotá as "Bogotá D.C." -- drop the suffix for display.
export function formatCity(city?: string): string | undefined {
  return city?.replace(/\s+D\.?\s*C\.?$/i, "").trim() || undefined
}
