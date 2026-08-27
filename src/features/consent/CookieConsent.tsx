"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Switch from "@/components/ui/Switch"
import { useConsentStore } from "./consentStore"

// Ancré en bas à droite (mobile et desktop) — même coin que WhatsappButton,
// donc on se pousse mutuellement via --cookie-banner-offset (lu par
// WhatsappButton) pendant que ce composant est visible, en plus du
// --sticky-cta-offset existant (BoxStickyCTA) qu'on lit nous-mêmes.
const OFFSET_GAP_PX = 12

export default function CookieConsent() {
  const hasHydrated = useConsentStore((s) => s.hasHydrated)
  const hasDecided = useConsentStore((s) => s.hasDecided)
  const isPanelOpen = useConsentStore((s) => s.isPanelOpen)
  const draftAnalytics = useConsentStore((s) => s.draftAnalytics)
  const init = useConsentStore((s) => s.init)
  const acceptAll = useConsentStore((s) => s.acceptAll)
  const rejectOptional = useConsentStore((s) => s.rejectOptional)
  const savePreferences = useConsentStore((s) => s.savePreferences)
  const setDraftAnalytics = useConsentStore((s) => s.setDraftAnalytics)
  const openPanel = useConsentStore((s) => s.openPanel)
  const closePanel = useConsentStore((s) => s.closePanel)

  const rootRef = useRef<HTMLDivElement>(null)
  const visible = hasHydrated && (!hasDecided || isPanelOpen)

  useEffect(() => {
    init()
  }, [init])

  // Lève WhatsappButton (même coin bas-droite) le temps que ce composant
  // occupe la zone — évite toute superposition sans jamais devoir déplacer
  // le bouton WhatsApp lui-même en dur.
  useEffect(() => {
    if (!visible) {
      document.documentElement.style.setProperty("--cookie-banner-offset", "0px")
      return
    }

    const el = rootRef.current
    if (!el) return

    const update = () => {
      document.documentElement.style.setProperty(
        "--cookie-banner-offset",
        `${el.offsetHeight + OFFSET_GAP_PX}px`
      )
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)

    return () => {
      observer.disconnect()
      document.documentElement.style.setProperty("--cookie-banner-offset", "0px")
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={rootRef}
      className="fixed right-4 bottom-[calc(0.9rem+env(safe-area-inset-bottom)+var(--sticky-cta-offset,0px))] z-50 w-[calc(100vw-2rem)] max-w-[336px] sm:right-6 sm:bottom-[calc(1.5rem+var(--sticky-cta-offset,0px))] sm:w-[368px]"
      role="dialog"
      aria-label="Preferencias de cookies"
    >
      <div
        className="rounded-[20px] border p-4 space-y-3"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--nm-border)",
          boxShadow: "0 10px 28px rgba(24, 20, 15, 0.16)",
        }}
      >
        {!isPanelOpen ? (
          <>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-ink">Usamos cookies</p>
              <p className="text-xs text-muted leading-relaxed mt-1">
                Usamos cookies necesarias para que Vivabox funcione y, si lo permites, otras
                para entender cómo navegas y mejorar tu experiencia.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={acceptAll}
                className="vb-btn-dark h-11 flex-1 text-xs px-2"
              >
                Aceptar todas
              </button>
              <button
                onClick={rejectOptional}
                className="h-11 flex-1 px-2 flex items-center justify-center text-xs font-semibold rounded-[18px] border border-[rgba(24,20,15,0.28)] text-ink bg-transparent hover:bg-[rgba(24,20,15,0.05)] hover:border-[rgba(24,20,15,0.45)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
              >
                Rechazar opcionales
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <button
                onClick={openPanel}
                className="font-medium text-ink hover:opacity-70 transition-opacity underline underline-offset-2"
              >
                Configurar
              </button>
              <span aria-hidden="true">·</span>
              <Link
                href="/politica-de-datos#s10"
                className="font-medium text-ink hover:opacity-70 transition-opacity underline underline-offset-2"
              >
                Política de Cookies
              </Link>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-sm font-semibold text-ink">Preferencias de cookies</h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Tú decides qué cookies usamos. Las necesarias siempre estarán activas.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted/80 mb-1.5">
                Siempre activas
              </p>

              <div className="flex items-center justify-between gap-3 py-1">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink">Necesarias</p>
                  <p className="text-[11px] text-muted leading-snug mt-0.5">
                    Son esenciales para que Vivabox funcione correctamente.
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-ink/70 bg-[var(--color-base)] px-2.5 py-1 rounded-full whitespace-nowrap">
                  Siempre activas
                </span>
              </div>
            </div>

            <div className="border-t" style={{ borderColor: "var(--nm-border)" }} />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted/80 mb-1.5">
                Opcionales
              </p>

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink">
                    Analíticas{" "}
                    <span className="text-[10px] font-normal text-muted">
                      · {draftAnalytics ? "Activadas" : "Desactivadas"}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted leading-snug mt-0.5">
                    Nos ayudan a entender cómo navegas por Vivabox y mejorar el sitio.
                  </p>
                </div>
                <Switch
                  checked={draftAnalytics}
                  onChange={setDraftAnalytics}
                  label="Cookies analíticas"
                />
              </div>

              <div className="flex items-center justify-between gap-3 mt-1">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink">
                    Marketing{" "}
                    <span className="text-[10px] font-normal text-muted">· Desactivadas</span>
                  </p>
                  <p className="text-[11px] text-muted leading-snug mt-0.5">
                    No usamos cookies de marketing actualmente.
                  </p>
                </div>
                <Switch
                  checked={false}
                  disabled
                  label="Cookies de marketing (no disponible por ahora)"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <button onClick={savePreferences} className="vb-btn-dark h-11 w-full text-sm">
                Guardar preferencias
              </button>
              {hasDecided && (
                <button
                  onClick={closePanel}
                  className="h-7 text-xs font-medium text-muted hover:text-ink transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
