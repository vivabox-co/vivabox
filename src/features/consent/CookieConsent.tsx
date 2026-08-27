"use client"

import { useEffect } from "react"
import { BarChart3, Megaphone, ShieldCheck } from "lucide-react"
import { useConsentStore } from "./consentStore"

export default function CookieConsent() {
  const hasHydrated = useConsentStore((s) => s.hasHydrated)
  const hasDecided = useConsentStore((s) => s.hasDecided)
  const isPanelOpen = useConsentStore((s) => s.isPanelOpen)
  const draftAnalytics = useConsentStore((s) => s.draftAnalytics)
  const draftMarketing = useConsentStore((s) => s.draftMarketing)
  const init = useConsentStore((s) => s.init)
  const acceptAll = useConsentStore((s) => s.acceptAll)
  const rejectOptional = useConsentStore((s) => s.rejectOptional)
  const savePreferences = useConsentStore((s) => s.savePreferences)
  const setDraftAnalytics = useConsentStore((s) => s.setDraftAnalytics)
  const setDraftMarketing = useConsentStore((s) => s.setDraftMarketing)
  const openPanel = useConsentStore((s) => s.openPanel)
  const closePanel = useConsentStore((s) => s.closePanel)

  useEffect(() => {
    init()
  }, [init])

  if (!hasHydrated) return null

  const visible = !hasDecided || isPanelOpen
  if (!visible) return null

  return (
    <div
      className="fixed inset-x-4 bottom-[calc(0.75rem+var(--sticky-cta-offset,0px))] z-50 sm:inset-x-auto sm:left-5 sm:w-[420px] sm:bottom-[calc(1.25rem+var(--sticky-cta-offset,0px))] lg:w-[480px]"
      role="dialog"
      aria-label="Preferencias de cookies"
    >
      <div
        className="rounded-[20px] border p-3.5 space-y-2"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--nm-border)",
          boxShadow: "0 10px 26px rgba(24, 20, 15, 0.18)",
        }}
      >
        {!isPanelOpen ? (
          <>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <p className="text-xs text-ink leading-snug flex-1">
                Usamos cookies para que el sitio funcione bien y entender cómo lo usas.
              </p>

              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={acceptAll}
                  className="vb-btn-dark h-8 px-3 text-xs whitespace-nowrap"
                >
                  Aceptar todas
                </button>
                <button
                  onClick={rejectOptional}
                  className="h-8 px-3 text-xs font-semibold whitespace-nowrap rounded-[18px] border border-[rgba(24,20,15,0.35)] text-ink bg-transparent hover:bg-[rgba(24,20,15,0.06)] hover:border-[rgba(24,20,15,0.55)] transition-colors"
                >
                  Rechazar opcionales
                </button>
              </div>
            </div>

            <button
              onClick={openPanel}
              className="block text-[11px] font-medium text-ink hover:opacity-70 transition-opacity underline underline-offset-2"
            >
              Configurar
            </button>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-sm font-semibold text-ink">Preferencias de cookies</h2>
              <p className="text-xs text-muted mt-1">
                Elige qué cookies permites. Puedes cambiarlo cuando quieras desde el pie de página.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="vb-choice" style={{ cursor: "default", padding: "9px 10px", gap: "8px" }}>
                <input type="checkbox" checked readOnly disabled />
                <span className="vb-choice-icon" style={{ width: 26, height: 26 }}>
                  <ShieldCheck size={13} strokeWidth={1.75} />
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-medium text-ink">Necesarias</span>
                  <span className="block text-[11px] text-muted">Hacen que el sitio funcione.</span>
                </span>
              </label>

              <label className="vb-choice" style={{ padding: "9px 10px", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={draftAnalytics}
                  onChange={(e) => setDraftAnalytics(e.target.checked)}
                />
                <span className="vb-choice-icon" style={{ width: 26, height: 26 }}>
                  <BarChart3 size={13} strokeWidth={1.75} />
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-medium text-ink">Analíticas</span>
                  <span className="block text-[11px] text-muted">Cómo usas Vivabox.</span>
                </span>
              </label>

              <label className="vb-choice" style={{ padding: "9px 10px", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={draftMarketing}
                  onChange={(e) => setDraftMarketing(e.target.checked)}
                />
                <span className="vb-choice-icon" style={{ width: 26, height: 26 }}>
                  <Megaphone size={13} strokeWidth={1.75} />
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-medium text-ink">Marketing</span>
                  <span className="block text-[11px] text-muted">Por ahora sin uso.</span>
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <button onClick={savePreferences} className="vb-btn-dark h-9 w-full text-sm">
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
