import { create } from "zustand"
import { readStoredConsent, writeStoredConsent, pushConsentUpdate } from "@/lib/consent"

type ConsentStoreState = {
  // HYDRATION — même idiome que useCheckoutStore : rien à afficher tant que
  // le client n'a pas lu le localStorage, pour éviter un flash SSR/client.
  hasHydrated: boolean
  hasDecided: boolean

  analytics: boolean
  marketing: boolean

  isPanelOpen: boolean

  // Brouillon du panneau "Configurar" — copié depuis analytics/marketing au
  // moment de l'ouverture (dans openPanel), pas via un effect côté
  // composant : on ne touche au store "officiel" qu'au clic sur "Guardar".
  draftAnalytics: boolean
  draftMarketing: boolean

  init: () => void
  acceptAll: () => void
  rejectOptional: () => void
  savePreferences: () => void
  setDraftAnalytics: (value: boolean) => void
  setDraftMarketing: (value: boolean) => void
  openPanel: () => void
  closePanel: () => void
}

function persistAndNotify(analytics: boolean, marketing: boolean) {
  writeStoredConsent({ analytics, marketing, decidedAt: Date.now() })
  pushConsentUpdate({ analytics, marketing })
}

export const useConsentStore = create<ConsentStoreState>((set, get) => ({
  hasHydrated: false,
  hasDecided: false,
  analytics: false,
  marketing: false,
  isPanelOpen: false,
  draftAnalytics: false,
  draftMarketing: false,

  init: () => {
    const stored = readStoredConsent()
    set({
      hasHydrated: true,
      hasDecided: !!stored,
      analytics: stored?.analytics ?? false,
      marketing: stored?.marketing ?? false,
    })
  },

  acceptAll: () => {
    persistAndNotify(true, true)
    set({ hasDecided: true, analytics: true, marketing: true, isPanelOpen: false })
  },

  rejectOptional: () => {
    persistAndNotify(false, false)
    set({ hasDecided: true, analytics: false, marketing: false, isPanelOpen: false })
  },

  savePreferences: () => {
    const { draftAnalytics, draftMarketing } = get()
    persistAndNotify(draftAnalytics, draftMarketing)
    set({ hasDecided: true, analytics: draftAnalytics, marketing: draftMarketing, isPanelOpen: false })
  },

  setDraftAnalytics: (value) => set({ draftAnalytics: value }),
  setDraftMarketing: (value) => set({ draftMarketing: value }),

  openPanel: () => {
    const { analytics, marketing } = get()
    set({ isPanelOpen: true, draftAnalytics: analytics, draftMarketing: marketing })
  },

  closePanel: () => set({ isPanelOpen: false }),
}))
