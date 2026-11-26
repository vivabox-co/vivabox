// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CONSENT_STORAGE_KEY } from "@/lib/consent"
import CookieConsent from "./CookieConsent"
import { useConsentStore } from "./consentStore"

class FakeResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

const stored = () => JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null")

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", FakeResizeObserver)
  localStorage.clear()
  window.gtag = vi.fn()
  useConsentStore.setState({
    hasHydrated: false,
    hasDecided: false,
    analytics: false,
    marketing: false,
    isPanelOpen: false,
    draftAnalytics: false,
    draftMarketing: false,
  })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("<CookieConsent />", () => {
  it("asks a first-time visitor, with both choices equally available", async () => {
    render(<CookieConsent />)
    expect(await screen.findByText("Usamos cookies")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Rechazar opcionales" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Aceptar todas" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Política de Cookies" }).getAttribute("href")).toBe("/politica-de-datos#s10")
  })

  it("sets nothing before the visitor chooses", async () => {
    render(<CookieConsent />)
    await screen.findByText("Usamos cookies")
    expect(stored()).toBeNull()
    expect(window.gtag).not.toHaveBeenCalled()
  })

  it("stays hidden for someone who already decided", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ analytics: false, marketing: false, decidedAt: 1 }))
    render(<CookieConsent />)
    expect(screen.queryByText("Usamos cookies")).toBeNull()
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("'Aceptar todas' saves the choice and closes the banner", async () => {
    const user = userEvent.setup()
    render(<CookieConsent />)
    await user.click(await screen.findByRole("button", { name: "Aceptar todas" }))
    expect(stored()).toMatchObject({ analytics: true, marketing: true })
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("'Rechazar opcionales' saves a refusal and closes the banner", async () => {
    const user = userEvent.setup()
    render(<CookieConsent />)
    await user.click(await screen.findByRole("button", { name: "Rechazar opcionales" }))
    expect(stored()).toMatchObject({ analytics: false, marketing: false })
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("lets the visitor pick analytics only, and keeps marketing locked off", async () => {
    const user = userEvent.setup()
    render(<CookieConsent />)
    await user.click(await screen.findByRole("button", { name: "Configurar" }))

    const analytics = screen.getByRole("switch", { name: "Cookies analíticas" })
    const marketing = screen.getByRole("switch", { name: /Cookies de marketing/ })
    expect(analytics.getAttribute("aria-checked")).toBe("false")
    expect((marketing as HTMLButtonElement).disabled).toBe(true)

    await user.click(analytics)
    expect(analytics.getAttribute("aria-checked")).toBe("true")
    expect(stored()).toBeNull() // nothing saved until "Guardar"

    await user.click(screen.getByRole("button", { name: "Guardar preferencias" }))
    expect(stored()).toMatchObject({ analytics: true, marketing: false })
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("offers 'Cancelar' only to someone who already decided, and cancelling keeps their choice", async () => {
    const user = userEvent.setup()
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ analytics: true, marketing: false, decidedAt: 1 }))
    render(<CookieConsent />)

    // Reopened later from the footer link.
    useConsentStore.getState().openPanel()
    await user.click(await screen.findByRole("button", { name: "Cancelar" }))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(stored()).toMatchObject({ analytics: true })
  })

  it("does not offer 'Cancelar' to a first-time visitor (a choice is required)", async () => {
    const user = userEvent.setup()
    render(<CookieConsent />)
    await user.click(await screen.findByRole("button", { name: "Configurar" }))
    expect(screen.queryByRole("button", { name: "Cancelar" })).toBeNull()
  })
})
