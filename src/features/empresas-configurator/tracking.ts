export const QUANTITY_OPTIONS = ["10 a 25", "26 a 50", "51 a 100", "Más de 100"] as const
export const DEFAULT_MESSAGE = "Gracias por este año juntos.\nTe lo mereces."
export const MESSAGE_MAX = 140
export const SIGNATURE_MAX = 40

export type MaquetaPayload = {
  id: string
  event: "edit" | "cta"
  logoThumb?: string | null
  message?: string
  quantity?: string
  neededBy?: string
  signature?: string
  frontText?: number
  frontCustom?: string
  logoSize?: number
  brandColor?: string
  meta?: { referrer?: string; utm?: Record<string, string>; device?: "mobile" | "desktop" }
}

// Fire-and-forget: tracking must never block or break the configurator.
export function sendMaqueta(payload: MaquetaPayload, keepalive = false) {
  return fetch("/api/empresas/maqueta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive,
  }).catch(() => {})
}

export function newMaquetaId(): string {
  const c: Crypto = crypto
  if (typeof c.randomUUID === "function") return c.randomUUID()
  // Fallback for very old browsers: 128 random bits formatted as a v4 UUID.
  const b = c.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("")
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

export function collectMeta(): NonNullable<MaquetaPayload["meta"]> {
  const params = new URLSearchParams(window.location.search)
  const utm: Record<string, string> = {}
  params.forEach((v, k) => {
    if (k.startsWith("utm_")) utm[k] = v.slice(0, 100)
  })
  return {
    referrer: document.referrer.slice(0, 300) || undefined,
    utm: Object.keys(utm).length ? utm : undefined,
    device: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
  }
}
