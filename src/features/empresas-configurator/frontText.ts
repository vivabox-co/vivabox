// Text printed under the logo on the front of the sleeve. It always sits on
// ONE line at the same size as the original Vivabox print (~38 px on the
// texture), so phrases must stay short. "Elige tu experiencia" (script) is the
// same for every option except the original Vivabox one, which keeps its own
// printed lines.

export type FrontTextPreset = {
  id: number
  label: string
  line1: string | null // serif line; null keeps the original Vivabox print
}

export const CUSTOM_FRONT_TEXT_ID = 4
export const CUSTOM_FRONT_TEXT_MAX = 22

export const FRONT_TEXTS: readonly FrontTextPreset[] = [
  { id: 0, label: "Un regalo para ti.", line1: "Un regalo para ti." },
  { id: 1, label: "Gracias por todo.", line1: "Gracias por todo." },
  { id: 2, label: "Eres parte del equipo.", line1: "Eres parte del equipo." },
  { id: 3, label: "Un regalo. Muchas experiencias.", line1: null },
  { id: CUSTOM_FRONT_TEXT_ID, label: "Otro", line1: "" },
]

export const DEFAULT_FRONT_TEXT = 0

// The line to print, or null to keep the original Vivabox text.
export function resolveFrontLine(id: number, custom: string): string | null {
  if (id === CUSTOM_FRONT_TEXT_ID) {
    return custom.trim().slice(0, CUSTOM_FRONT_TEXT_MAX) || FRONT_TEXTS[DEFAULT_FRONT_TEXT].line1
  }
  const preset = FRONT_TEXTS.find((t) => t.id === id) ?? FRONT_TEXTS[DEFAULT_FRONT_TEXT]
  return preset.line1
}

// Colors always offered for the script, next to the ones found in the logo.
export const BRAND_COLORS = [
  { name: "Rojo Vivabox", hex: "#C8102E" },
  { name: "Azul marino", hex: "#152F40" },
  { name: "Negro", hex: "#111111" },
] as const

// Logo size choices: share of the largest box the logo may fill.
export const LOGO_SIZES = [
  { id: 0, label: "S", scale: 0.65 },
  { id: 1, label: "M", scale: 0.85 },
  { id: 2, label: "L", scale: 1 },
] as const
export const DEFAULT_LOGO_SIZE = 1

export function logoScale(id: number): number {
  return (LOGO_SIZES.find((s) => s.id === id) ?? LOGO_SIZES[DEFAULT_LOGO_SIZE]).scale
}
