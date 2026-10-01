import { create } from "zustand"
import { persist } from "zustand/middleware"

type CheckoutBox = {
  slug: string
  name: string
  price: number
}

export type DeliveryMethod = "domicilio" | "retiro" | "digital"
export type DeliveryDestination = "self" | "recipient" | null

type Pricing = {
  subtotal: number
  delivery: number
  total: number
  discount?: number
}

type CheckoutState = {
  // PRODUCT
  box: CheckoutBox | null
  quantity: number

  // BUYER
  buyerName: string
  buyerPhone: string
  buyerEmail: string

  // DELIVERY
  deliveryMethod: DeliveryMethod
  deliveryDestination: DeliveryDestination

  recipientName: string
  recipientPhone: string
  address: string
  city: string
  addressExtra: string

  // PROMOTIONS (mock, only one active at a time)
  promoCode: string
  promoApplied: boolean

  // BACKEND DATA (SOURCE OF TRUTH)
  pricing: Pricing | null
  pricingUpdatedAt: number | null
  isPricingLoading: boolean

  // SYSTEM
  ventaId: string | null

  // HYDRATION
  hasHydrated: boolean
  setHasHydrated: (value: boolean) => void

  // FUTURE
  multiBeneficiary: boolean

  // ACTIONS
  setBox: (box: CheckoutBox) => void
  setQuantity: (q: number) => void

  setBuyer: (data: {
    name: string
    phone: string
    email: string
  }) => void

  setDeliveryMethod: (method: DeliveryMethod) => void
  setDestination: (destination: DeliveryDestination) => void

  setRecipientInfo: (data: { name: string; phone: string }) => void
  setAddressInfo: (data: { address: string; city: string; addressExtra: string }) => void

  setPromo: (code: string, applied: boolean) => void

  setMultiBeneficiary: (value: boolean) => void

  setVentaId: (id: string | null) => void

  setPricing: (pricing: Pricing | null) => void
  setPricingLoading: (val: boolean) => void

  isValidForPayment: () => boolean

  reset: () => void
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      // ======================
      // INITIAL STATE
      // ======================

      box: null,
      quantity: 1,

      buyerName: "",
      buyerPhone: "",
      buyerEmail: "",

      deliveryMethod: "domicilio",
      deliveryDestination: null,

      recipientName: "",
      recipientPhone: "",
      address: "",
      city: "",
      addressExtra: "",

      promoCode: "",
      promoApplied: false,


      pricing: null,
      pricingUpdatedAt: null,
      isPricingLoading: false,

      ventaId: null,

      hasHydrated: false,
      multiBeneficiary: false,

      // ======================
      // ACTIONS
      // ======================

      setBox: (box) =>
        set({
          box,
          pricing: null,
          pricingUpdatedAt: null,
        }),

      setQuantity: (q) =>
        set({
          quantity: q,
          pricing: null,
          pricingUpdatedAt: null,
        }),

      setBuyer: ({ name, phone, email }) =>
        set({
          buyerName: name,
          buyerPhone: phone,
          buyerEmail: email,
        }),

      setDeliveryMethod: (method) =>
        set({
          deliveryMethod: method,
          deliveryDestination: method === "domicilio" ? get().deliveryDestination : null,
          pricing: null,
          pricingUpdatedAt: null,
        }),

      setDestination: (destination) => set({ deliveryDestination: destination }),

      setRecipientInfo: ({ name, phone }) =>
        set({ recipientName: name, recipientPhone: phone }),

      setAddressInfo: ({ address, city, addressExtra }) =>
        set({ address, city, addressExtra }),

      setPromo: (code, applied) =>
        set({
          promoCode: code,
          promoApplied: applied,
        }),

      setMultiBeneficiary: (value) =>
        set({ multiBeneficiary: value }),

      setHasHydrated: (value) =>
        set({ hasHydrated: value }),

      setVentaId: (ventaId) => set({ ventaId }),

      setPricing: (pricing) =>
        set({
          pricing,
          pricingUpdatedAt: pricing ? Date.now() : null,
        }),

      setPricingLoading: (val) =>
        set({ isPricingLoading: val }),

      // ======================
      // VALIDATION
      // ======================

      isValidForPayment: () => {
        const {
          box,
          buyerName,
          buyerEmail,
          deliveryMethod,
          deliveryDestination,
          address,
          city,
          recipientName,
          recipientPhone,
          pricing,
        } = get()

        if (!box) return false
        if (!buyerName || !buyerEmail) return false

        if (deliveryMethod === "domicilio") {
          if (!deliveryDestination) return false
          if (!address || !city) return false
          if (deliveryDestination === "recipient" && (!recipientName || !recipientPhone)) return false
        }

        // 🔥 IMPORTANT: pricing still required for payment step
        if (!pricing) return false

        return true
      },

      // ======================
      // RESET
      // ======================

      reset: () =>
        set({
          box: null,
          quantity: 1,
          buyerName: "",
          buyerPhone: "",
          buyerEmail: "",

          deliveryMethod: "domicilio",
          deliveryDestination: null,

          recipientName: "",
          recipientPhone: "",
          address: "",
          city: "",
          addressExtra: "",

          promoCode: "",
          promoApplied: false,

          pricing: null,
          pricingUpdatedAt: null,
          isPricingLoading: false,

          ventaId: null,

          hasHydrated: false,
          multiBeneficiary: false,
        }),
    }),
    {
      name: "checkout-storage",

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
