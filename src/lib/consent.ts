// Consentimiento de cookies (Opción B, ver docs/09_checkout.md para el resto
// de la arquitectura del sitio). Todo lo que toca `CONSENT_STORAGE_KEY` debe
// mantenerse en sync con el script inline de
// `src/components/analytics/ConsentDefault.tsx`, que lee esta misma clave
// ANTES de que React hidrate — no puede importar este módulo porque corre
// como texto plano en un <script beforeInteractive>.

export const CONSENT_STORAGE_KEY = "vivabox-consent"

export type ConsentChoice = {
  analytics: boolean
  marketing: boolean
  decidedAt: number
}

export function readStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (typeof parsed?.analytics !== "boolean" || typeof parsed?.marketing !== "boolean") {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function writeStoredConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice))
  } catch {
    // localStorage indisponible (navegación privada, cuota llena...) — el
    // consentimiento no persiste entre visitas, pero nada se rompe.
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

// Informa a Google Consent Mode del cambio. El tag GA4 en GTM
// (GTM-MFM7N8BN, "Etiqueta de Google") ya trae las 4 comprobaciones de
// consentimiento integradas (ad_storage, ad_user_data, ad_personalization,
// analytics_storage) — no requiere ninguna config adicional del lado de GTM.
export function pushConsentUpdate(choice: Pick<ConsentChoice, "analytics" | "marketing">) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return

  window.gtag("consent", "update", {
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_storage: choice.marketing ? "granted" : "denied",
    ad_user_data: choice.marketing ? "granted" : "denied",
    ad_personalization: choice.marketing ? "granted" : "denied",
  })
}
