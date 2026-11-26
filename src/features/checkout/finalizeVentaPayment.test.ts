import type { SupabaseClient } from "@supabase/supabase-js"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/services/buyerEmail", () => ({ sendBuyerEmail: vi.fn() }))
vi.mock("@/services/email", () => ({ sendSameDayAlertEmail: vi.fn() }))
vi.mock("@/features/checkout/completeVenta", () => ({ completeVenta: vi.fn() }))

import { finalizeVentaPayment } from "./finalizeVentaPayment"

// Only the "expected total" lookup matters here: a wrong amount must be refused
// before any update to the venta is attempted.
function fakeSupabase(lookup: { data: { total: number } | null; error?: unknown }) {
  const update = vi.fn()
  const client = {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ error: null, ...lookup }) }) }),
      update,
    }),
  }
  return { client: client as unknown as SupabaseClient, update }
}

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}))
afterEach(() => vi.restoreAllMocks())

describe("finalizeVentaPayment — amount guard", () => {
  it("refuses a payment smaller than the venta total, without touching the venta", async () => {
    const { client, update } = fakeSupabase({ data: { total: 59900 } })
    const result = await finalizeVentaPayment(client, "v1", { amountInCents: 100, currency: "COP" })
    expect(result).toEqual({ ok: false, error: "AMOUNT_MISMATCH" })
    expect(update).not.toHaveBeenCalled()
  })

  it("refuses a payment in another currency", async () => {
    const { client, update } = fakeSupabase({ data: { total: 59900 } })
    const result = await finalizeVentaPayment(client, "v1", { amountInCents: 5990000, currency: "USD" })
    expect(result).toEqual({ ok: false, error: "AMOUNT_MISMATCH" })
    expect(update).not.toHaveBeenCalled()
  })

  it("reports NOT_FOUND for an unknown venta", async () => {
    const { client } = fakeSupabase({ data: null })
    const result = await finalizeVentaPayment(client, "nope", { amountInCents: 1, currency: "COP" })
    expect(result).toEqual({ ok: false, error: "NOT_FOUND" })
  })

  it("reports SERVER_ERROR when the lookup fails", async () => {
    const { client } = fakeSupabase({ data: null, error: new Error("db down") })
    const result = await finalizeVentaPayment(client, "v1", { amountInCents: 1, currency: "COP" })
    expect(result).toEqual({ ok: false, error: "SERVER_ERROR" })
  })
})
