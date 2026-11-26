// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CONSENT_STORAGE_KEY, readStoredConsent } from "@/lib/consent"
import { useConsentStore } from "./consentStore"

const store = () => useConsentStore.getState()
const stored = () => JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null")

beforeEach(() => {
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

describe("consent store — nothing optional without a choice", () => {
  it("starts with analytics and marketing off, undecided", () => {
    expect(store()).toMatchObject({ analytics: false, marketing: false, hasDecided: false })
  })

  it("init with nothing stored leaves the banner to show", () => {
    store().init()
    expect(store()).toMatchObject({ hasHydrated: true, hasDecided: false, analytics: false, marketing: false })
  })

  it("init restores a previous choice without asking again", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ analytics: true, marketing: false, decidedAt: 1 }))
    store().init()
    expect(store()).toMatchObject({ hasDecided: true, analytics: true, marketing: false })
  })

  it.each(["not json", '{"analytics":"yes","marketing":true}', "{}", "null"])("init ignores a corrupt stored value %j", (raw) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, raw)
    store().init()
    expect(store()).toMatchObject({ hasDecided: false, analytics: false, marketing: false })
  })
})

describe("consent store — choices are saved and sent to Google Consent Mode", () => {
  it("accept all grants everything, stores it and closes the panel", () => {
    store().openPanel()
    store().acceptAll()
    expect(store()).toMatchObject({ hasDecided: true, analytics: true, marketing: true, isPanelOpen: false })
    expect(stored()).toMatchObject({ analytics: true, marketing: true })
    expect(window.gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({ analytics_storage: "granted", ad_storage: "granted" }))
  })

  it("reject optional denies everything and still records that the visitor decided", () => {
    store().rejectOptional()
    expect(store()).toMatchObject({ hasDecided: true, analytics: false, marketing: false })
    expect(stored()).toMatchObject({ analytics: false, marketing: false })
    expect(window.gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({ analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied" }))
  })

  it("saving preferences applies the draft, and marketing alone does not enable analytics", () => {
    store().openPanel()
    store().setDraftMarketing(true)
    store().savePreferences()
    expect(store()).toMatchObject({ analytics: false, marketing: true, hasDecided: true })
    expect(window.gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({ analytics_storage: "denied", ad_storage: "granted" }))
  })

  it("does not touch the saved choice while the panel is only being edited", () => {
    store().acceptAll()
    store().openPanel()
    store().setDraftAnalytics(false)
    store().closePanel()
    expect(store()).toMatchObject({ analytics: true, marketing: true })
    expect(readStoredConsent()).toMatchObject({ analytics: true })
  })

  it("starts the draft from the current choice when the panel opens", () => {
    store().acceptAll()
    store().openPanel()
    expect(store()).toMatchObject({ isPanelOpen: true, draftAnalytics: true, draftMarketing: true })
  })

  it("still works when localStorage or gtag are unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota")
    })
    window.gtag = undefined
    expect(() => store().acceptAll()).not.toThrow()
    expect(store().analytics).toBe(true)
    vi.restoreAllMocks()
  })
})
