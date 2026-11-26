// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { useCheckoutStore } from "./checkoutStore"
import { useDisplayPricing } from "./useDisplayPricing"
import { renderHook } from "@testing-library/react"
import { MESSAGE_MAX_LENGTH, messageOverflow } from "./personalMessage"

const box = { slug: "vivabox", name: "Vivabox", price: 199000 }
const pricing = { subtotal: 199000, delivery: 0, total: 199000, discount: 0 }

const state = () => useCheckoutStore.getState()

// Everything required to pay a home delivery to oneself.
function fillValidOrder() {
  const s = state()
  s.setBox(box)
  s.setBuyer({ name: "Ana", phone: "300", email: "ana@example.com" })
  s.setDeliveryMethod("domicilio")
  s.setDestination("self")
  s.setAddressInfo({ address: "Cra 7 # 10-20", city: "Medellín", addressExtra: "" })
  s.setPricing(pricing)
}

beforeEach(() => {
  localStorage.clear()
  state().reset()
})

describe("checkout store — pricing is invalidated whenever the order changes", () => {
  it.each([
    ["the box", () => state().setBox(box)],
    ["the quantity", () => state().setQuantity(3)],
    ["the delivery method", () => state().setDeliveryMethod("digital")],
    ["same-day delivery", () => state().setSameDay(true)],
  ])("clears the server price when %s changes, so a stale total can never be paid", (_label, change) => {
    state().setPricing(pricing)
    expect(state().pricing).not.toBeNull()
    change()
    expect(state().pricing).toBeNull()
    expect(state().pricingUpdatedAt).toBeNull()
  })

  it("keeps the price when only buyer or address details change", () => {
    state().setPricing(pricing)
    state().setBuyer({ name: "Ana", phone: "1", email: "a@b.co" })
    state().setAddressInfo({ address: "x", city: "y", addressExtra: "" })
    expect(state().pricing).toEqual(pricing)
  })

  it("timestamps a price and clears the timestamp with it", () => {
    state().setPricing(pricing)
    expect(state().pricingUpdatedAt).toBeTypeOf("number")
    state().setPricing(null)
    expect(state().pricingUpdatedAt).toBeNull()
  })

  it("forgets the destination when the box is not delivered to a home", () => {
    state().setDeliveryMethod("domicilio")
    state().setDestination("recipient")
    state().setDeliveryMethod("domicilio")
    expect(state().deliveryDestination).toBe("recipient")
    state().setDeliveryMethod("digital")
    expect(state().deliveryDestination).toBeNull()
  })
})

describe("checkout store — isValidForPayment", () => {
  it("accepts a complete home delivery to oneself", () => {
    fillValidOrder()
    expect(state().isValidForPayment()).toBe(true)
  })

  it("refuses an empty cart", () => {
    expect(state().isValidForPayment()).toBe(false)
  })

  it("refuses to pay before the server has priced the order", () => {
    fillValidOrder()
    state().setPricing(null)
    expect(state().isValidForPayment()).toBe(false)
  })

  it.each([
    ["buyer name", () => state().setBuyer({ name: "", phone: "300", email: "a@b.co" })],
    ["buyer email", () => state().setBuyer({ name: "Ana", phone: "300", email: "" })],
    ["address", () => state().setAddressInfo({ address: "", city: "Cali", addressExtra: "" })],
    ["city", () => state().setAddressInfo({ address: "Calle 1", city: "", addressExtra: "" })],
  ])("refuses a home delivery without %s", (_label, breakIt) => {
    fillValidOrder()
    breakIt()
    state().setPricing(pricing)
    expect(state().isValidForPayment()).toBe(false)
  })

  it("refuses a home delivery with no destination chosen", () => {
    fillValidOrder()
    state().setDestination(null)
    expect(state().isValidForPayment()).toBe(false)
  })

  it("requires the recipient's name and phone for a gift", () => {
    fillValidOrder()
    state().setDestination("recipient")
    expect(state().isValidForPayment()).toBe(false)
    state().setRecipientInfo({ name: "Luis", phone: "" })
    expect(state().isValidForPayment()).toBe(false)
    state().setRecipientInfo({ name: "Luis", phone: "310" })
    expect(state().isValidForPayment()).toBe(true)
  })

  it("does not ask for an address when the box is digital", () => {
    state().setBox(box)
    state().setBuyer({ name: "Ana", phone: "", email: "ana@example.com" })
    state().setDeliveryMethod("digital")
    state().setPricing(pricing)
    expect(state().isValidForPayment()).toBe(true)
  })
})

describe("checkout store — reset and persistence", () => {
  it("reset empties the whole order, including the venta id and the promo", () => {
    fillValidOrder()
    state().setPromo("VIVA10", true)
    state().setVentaId("venta-1")
    state().reset()
    expect(state()).toMatchObject({ box: null, quantity: 1, buyerEmail: "", promoCode: "", promoApplied: false, ventaId: null, pricing: null })
  })

  it("persists the order in localStorage under checkout-storage", () => {
    fillValidOrder()
    const saved = JSON.parse(localStorage.getItem("checkout-storage")!)
    expect(saved.state).toMatchObject({ buyerEmail: "ana@example.com", city: "Medellín" })
  })
})

describe("useDisplayPricing", () => {
  const estimate = { subtotal: 199000, delivery: 10000, total: 209000, discount: 10000 }

  it("shows the estimate minus the code benefit before the server has priced the order", () => {
    const { result } = renderHook(() => useDisplayPricing(estimate))
    expect(result.current).toMatchObject({ subtotal: 199000, delivery: 10000, discount: 10000, displayTotal: 199000, hasBenefit: true })
  })

  it("shows the server price as is once it exists (its total already includes the discount)", () => {
    state().setPricing({ subtotal: 199000, delivery: 0, total: 199000, discount: 10000 })
    const { result } = renderHook(() => useDisplayPricing(estimate))
    expect(result.current).toMatchObject({ delivery: 0, discount: 10000, displayTotal: 199000 })
  })

  it("has no benefit when there is no discount", () => {
    const { result } = renderHook(() => useDisplayPricing({ subtotal: 1, delivery: 0, total: 1 }))
    expect(result.current).toMatchObject({ discount: 0, hasBenefit: false, displayTotal: 1 })
  })
})

describe("personal message length", () => {
  it("reports how many characters overflow, never a negative number", () => {
    expect(messageOverflow("a".repeat(MESSAGE_MAX_LENGTH))).toBe(0)
    expect(messageOverflow("a".repeat(MESSAGE_MAX_LENGTH + 7))).toBe(7)
    expect(messageOverflow("")).toBe(0)
  })
})
