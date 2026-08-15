// Shared bridge between the hero subtitle's own fit-to-one-line size (set in
// Hero.tsx) and anything elsewhere on the page that needs to match it (the
// bridge steps in WhatsIncluded.tsx) -- a CSS custom property on the root
// element (for reads at any time) plus a same-tick event (so listeners don't
// have to wait for an unrelated resize to notice a new value).
export const SUBTITLE_FONT_SIZE_VAR = "--vb-subtitle-font-size"
export const SUBTITLE_FONT_SIZE_EVENT = "vb:subtitle-font-size"

export function writeSubtitleFontSize(size: number) {
  document.documentElement.style.setProperty(SUBTITLE_FONT_SIZE_VAR, `${size}px`)
  window.dispatchEvent(new CustomEvent(SUBTITLE_FONT_SIZE_EVENT, { detail: size }))
}

export function readSubtitleFontSize(fallback: number): number {
  if (typeof window === "undefined") return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(SUBTITLE_FONT_SIZE_VAR)
  const parsed = parseFloat(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
