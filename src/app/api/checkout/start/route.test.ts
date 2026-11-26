import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { insert, checkRateLimits, validatePromoCode } = vi.hoisted(() => ({
  insert: vi.fn(),
  checkRateLimits: vi.fn(),
  validatePromoCode: vi.fn(),
}))

vi.mock("@/services/supabase", () => ({
  getSupabase: () => ({
    from: () => ({ insert: (row: unknown) => ({ select: () => ({ single: () => insert(row) }) }) }),
  }),
}))
vi.mock("@/utils/rateLimit", async (orig) => ({
  ...(await orig<typeof import("@/utils/rateLimit")>()),
  checkRateLimits,
}))
vi.mock("@/features/promotions/validatePromoCode", () => ({ validatePromoCode }))

import { POST } from "./route"
import { SAME_DAY_PRICE_COP } from "@/features/checkout/sameDay"

const PRICE = 199000 // data/boxes.ts — "vivabox"

const digital = {
  box: "vivabox",
  quantity: 1,
  buyer: { name: "Ana Pérez", email: "ana@example.com", phone: "3001234567" },
  delivery: { type: "digital" },
}

const physical = {
  ...digital,
  delivery: { type: "physical" },
  destination: "self",
  address: { address: "Cra 7 # 10-20", city: "Medellín", addressExtra: "Apto 301" },
}

function start(body: unknown) {
  return POST(new Request("http://localhost/api/checkout/start", { method: "POST", body: JSON.stringify(body) }))
}

async function json(res: Response) {
  return (await res.json()) as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  checkRateLimits.mockResolvedValue(true)
  validatePromoCode.mockResolvedValue({ valid: true })
  insert.mockResolvedValue({ data: { id: "venta-1" }, error: null })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("/api/checkout/start — validation", () => {
  it.each([
    ["unknown box", { ...digital, box: "nope" }, "INVALID_BOX"],
    ["missing box", { ...digital, box: undefined }, "INVALID_BOX"],
    ["zero quantity", { ...digital, quantity: 0 }, "INVALID_QUANTITY"],
    ["too many boxes", { ...digital, quantity: 11 }, "INVALID_QUANTITY"],
    ["fractional quantity", { ...digital, quantity: 1.5 }, "INVALID_QUANTITY"],
    ["string quantity", { ...digital, quantity: "2" }, "INVALID_QUANTITY"],
    ["missing buyer name", { ...digital, buyer: { ...digital.buyer, name: " " } }, "MISSING_BUYER"],
    ["invalid email", { ...digital, buyer: { ...digital.buyer, email: "ana@" } }, "INVALID_EMAIL"],
    ["unknown delivery type", { ...digital, delivery: { type: "drone" } }, "INVALID_DELIVERY_TYPE"],
    ["physical without destination", { ...physical, destination: undefined }, "MISSING_DESTINATION"],
    ["physical without address", { ...physical, address: { city: "Cali" } }, "MISSING_ADDRESS"],
    [
      "gift without recipient phone",
      { ...physical, destination: "recipient", recipient: { name: "Luis" } },
      "MISSING_RECIPIENT",
    ],
    ["self delivery without buyer phone", { ...physical, buyer: { ...digital.buyer, phone: "" } }, "MISSING_BUYER_PHONE"],
  ])("rejects %s", async (_label, body, error) => {
    const res = await json(await start(body))
    expect(res).toMatchObject({ ok: false, error })
    expect(insert).not.toHaveBeenCalled()
  })

  it("answers SERVER_ERROR (not a crash) on a non-JSON body", async () => {
    const res = await POST(new Request("http://localhost/x", { method: "POST", body: "nope" }))
    expect(await json(res)).toMatchObject({ ok: false, error: "SERVER_ERROR" })
  })

  it("refuses when the per-IP rate limit is exceeded, before inserting", async () => {
    checkRateLimits.mockResolvedValue(false)
    expect(await json(await start(digital))).toMatchObject({ ok: false, error: "TOO_MANY_ATTEMPTS" })
    expect(insert).not.toHaveBeenCalled()
  })
})

describe("/api/checkout/start — pricing is computed on the server", () => {
  it("charges the catalogue price times quantity, ignoring any price sent by the client", async () => {
    const res = await json(await start({ ...digital, quantity: 3, price: 1, total: 1, subtotal: 1 }))
    expect(res.ok).toBe(true)
    expect(res.pricing).toEqual({ subtotal: PRICE * 3, delivery: 0, total: PRICE * 3, discount: 0 })
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ box_slug: "vivabox", quantity: 3, subtotal: PRICE * 3, total: PRICE * 3 })
    )
  })

  it("returns the venta id for the payment step", async () => {
    expect(await json(await start(digital))).toMatchObject({ ok: true, ventaId: "venta-1", promoApplied: false })
  })

  it("stores the address for physical deliveries and blanks it for digital ones", async () => {
    await start(physical)
    expect(insert).toHaveBeenLastCalledWith(
      expect.objectContaining({ delivery_ciudad: "Medellín", delivery_direccion: "Cra 7 # 10-20", recipient_name: "Ana Pérez" })
    )
    await start({ ...digital, address: { address: "x", city: "y" } })
    expect(insert).toHaveBeenLastCalledWith(
      expect.objectContaining({ delivery_ciudad: "", delivery_direccion: "", recipient_contact: "" })
    )
  })

  it("uses the recipient's data when the box is a gift", async () => {
    await start({ ...physical, destination: "recipient", recipient: { name: "Luis", phone: "3109999999" } })
    expect(insert).toHaveBeenLastCalledWith(
      expect.objectContaining({ recipient_name: "Luis", recipient_contact: "3109999999" })
    )
  })

  it("truncates absurdly long free-text fields", async () => {
    await start({ ...digital, buyer: { ...digital.buyer, name: "a".repeat(500) } })
    const row = insert.mock.calls[0][0] as { buyer_name: string }
    expect(row.buyer_name).toHaveLength(100)
  })

  it("answers SERVER_ERROR when the insert fails", async () => {
    insert.mockResolvedValue({ data: null, error: { message: "db down" } })
    expect(await json(await start(digital))).toMatchObject({ ok: false, error: "SERVER_ERROR" })
  })
})

describe("/api/checkout/start — promo codes", () => {
  it("applies a valid code and records it in upper case", async () => {
    const res = await json(await start({ ...digital, promoCode: " viva10 " }))
    expect(res).toMatchObject({ ok: true, promoApplied: true, promoWarning: null })
    expect(validatePromoCode).toHaveBeenCalledWith(expect.anything(), "VIVA10", "ana@example.com")
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ promo_code_input: "VIVA10" }))
  })

  it("never blocks the purchase on an invalid code: full price plus a warning", async () => {
    validatePromoCode.mockResolvedValue({ valid: false, error: "EXPIRED" })
    const res = await json(await start({ ...digital, promoCode: "OLD" }))
    expect(res).toMatchObject({ ok: true, promoApplied: false, promoWarning: "EXPIRED" })
    expect(res.pricing.total).toBe(PRICE)
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ promo_code_input: null }))
  })

  it("keeps the full price and warns when promo attempts are rate limited", async () => {
    checkRateLimits.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    const res = await json(await start({ ...digital, promoCode: "GUESS" }))
    expect(res).toMatchObject({ ok: true, promoApplied: false, promoWarning: "TOO_MANY_ATTEMPTS" })
    expect(validatePromoCode).not.toHaveBeenCalled()
  })

  describe("test price code", () => {
    beforeEach(() => {
      vi.stubEnv("CHECKOUT_TEST_CODE", "PRUEBA9")
      vi.stubEnv("CHECKOUT_TEST_TOTAL", "")
    })

    it("charges the symbolic amount for a single box and marks the venta", async () => {
      const res = await json(await start({ ...digital, promoCode: "prueba9" }))
      expect(res.pricing).toMatchObject({ subtotal: 1000, delivery: 0, total: 1000 })
      expect(res.pricing.discount).toBe(PRICE - 1000)
      expect(insert).toHaveBeenCalledWith(expect.objectContaining({ promo_code_input: "PRUEBA", total: 1000 }))
      expect(validatePromoCode).not.toHaveBeenCalled()
    })

    it("does not apply to several boxes: full price and INVALID_CODE", async () => {
      const res = await json(await start({ ...digital, quantity: 2, promoCode: "PRUEBA9" }))
      expect(res.pricing.total).toBe(PRICE * 2)
      expect(res.promoWarning).toBe("INVALID_CODE")
    })

    it("is not recognised once the env var is removed", async () => {
      vi.stubEnv("CHECKOUT_TEST_CODE", "")
      validatePromoCode.mockResolvedValue({ valid: false, error: "INVALID_CODE" })
      const res = await json(await start({ ...digital, promoCode: "PRUEBA9" }))
      expect(res.pricing.total).toBe(PRICE)
    })
  })
})

describe("/api/checkout/start — same-day delivery", () => {
  // 2026-11-26 is a Thursday. Bogotá is UTC-5, so 15:00Z = 10:00 and 19:30Z = 14:30.
  const bogotaMorning = new Date("2026-11-26T15:00:00Z")
  const sameDay = { ...physical, address: { ...physical.address, city: "Bogotá D.C." }, delivery: { type: "physical", speed: "same_day" } }

  it("adds the surcharge when ordered in Bogotá before the cutoff", async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(bogotaMorning)
    const res = await json(await start(sameDay))
    expect(res.pricing).toMatchObject({ delivery: SAME_DAY_PRICE_COP, total: PRICE + SAME_DAY_PRICE_COP })
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ delivery_speed: "same_day" }))
  })

  it("keeps the surcharge even when a promo waives the normal delivery", async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(bogotaMorning)
    const res = await json(await start({ ...sameDay, promoCode: "VIVA10" }))
    expect(res.pricing.delivery).toBe(SAME_DAY_PRICE_COP)
  })

  it("is refused after the 2 p.m. cutoff", async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-26T19:30:00Z"))
    expect(await json(await start(sameDay))).toMatchObject({ ok: false, error: "SAME_DAY_UNAVAILABLE" })
    expect(insert).not.toHaveBeenCalled()
  })

  it("is refused outside Bogotá and for digital boxes", async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(bogotaMorning)
    const cali = { ...sameDay, address: { ...sameDay.address, city: "Cali" } }
    expect(await json(await start(cali))).toMatchObject({ error: "SAME_DAY_UNAVAILABLE" })
    expect(await json(await start({ ...digital, delivery: { type: "digital", speed: "same_day" } }))).toMatchObject({
      error: "SAME_DAY_UNAVAILABLE",
    })
  })
})
