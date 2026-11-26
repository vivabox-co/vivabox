import type { SupabaseClient } from "@supabase/supabase-js"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { validatePromoCode } from "./validatePromoCode"
import { getTestTotal, isTestPriceCode } from "./testPriceCode"

type Promo = {
  active: boolean
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  contact_email: string | null
}

function fakeSupabase(result: { data: Promo | null; error?: unknown }) {
  const eq = vi.fn(() => ({ maybeSingle: async () => ({ error: null, ...result }) }))
  const client = { from: () => ({ select: () => ({ eq }) }) }
  return { client: client as unknown as SupabaseClient, eq }
}

const base: Promo = { active: true, max_uses: null, uses_count: 0, expires_at: null, contact_email: null }

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}))
afterEach(() => vi.restoreAllMocks())

describe("validatePromoCode", () => {
  it("looks the code up trimmed and upper-cased", async () => {
    const { client, eq } = fakeSupabase({ data: base })
    await validatePromoCode(client, "  viva10 ", null)
    expect(eq).toHaveBeenCalledWith("code", "VIVA10")
  })

  it("accepts an active code", async () => {
    const { client } = fakeSupabase({ data: base })
    expect(await validatePromoCode(client, "X", null)).toEqual({ valid: true })
  })

  it("rejects unknown and inactive codes", async () => {
    expect(await validatePromoCode(fakeSupabase({ data: null }).client, "X", null)).toEqual({
      valid: false,
      error: "INVALID_CODE",
    })
    expect(await validatePromoCode(fakeSupabase({ data: { ...base, active: false } }).client, "X", null)).toEqual({
      valid: false,
      error: "INVALID_CODE",
    })
  })

  it("treats a database error as an invalid code, never as valid", async () => {
    const { client } = fakeSupabase({ data: null, error: new Error("boom") })
    expect(await validatePromoCode(client, "X", null)).toEqual({ valid: false, error: "INVALID_CODE" })
  })

  it("rejects expired codes", async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString()
    const { client } = fakeSupabase({ data: { ...base, expires_at: past } })
    expect(await validatePromoCode(client, "X", null)).toEqual({ valid: false, error: "EXPIRED" })
  })

  it("accepts codes that expire in the future", async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString()
    const { client } = fakeSupabase({ data: { ...base, expires_at: future } })
    expect(await validatePromoCode(client, "X", null)).toEqual({ valid: true })
  })

  it("rejects codes that reached max_uses, accepts one below", async () => {
    const full = fakeSupabase({ data: { ...base, max_uses: 5, uses_count: 5 } }).client
    const open = fakeSupabase({ data: { ...base, max_uses: 5, uses_count: 4 } }).client
    expect(await validatePromoCode(full, "X", null)).toEqual({ valid: false, error: "USED_UP" })
    expect(await validatePromoCode(open, "X", null)).toEqual({ valid: true })
  })

  it("checks ownership of personal codes only when the buyer email is known", async () => {
    const { client } = fakeSupabase({ data: { ...base, contact_email: "ana@example.com" } })
    expect(await validatePromoCode(client, "X", null)).toEqual({ valid: true })
    expect(await validatePromoCode(client, "X", "ANA@example.com ")).toEqual({ valid: true })
    expect(await validatePromoCode(client, "X", "otra@example.com")).toEqual({ valid: false, error: "NOT_YOURS" })
  })
})

describe("test price code", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("is disabled when CHECKOUT_TEST_CODE is not set", () => {
    vi.stubEnv("CHECKOUT_TEST_CODE", "")
    expect(isTestPriceCode("anything")).toBe(false)
    expect(isTestPriceCode("")).toBe(false)
  })

  it("matches the secret case-insensitively and ignores surrounding spaces", () => {
    vi.stubEnv("CHECKOUT_TEST_CODE", "Prueba-9")
    expect(isTestPriceCode(" prueba-9 ")).toBe(true)
    expect(isTestPriceCode("prueba-8")).toBe(false)
  })

  it("never charges less than 1000 COP", () => {
    vi.stubEnv("CHECKOUT_TEST_TOTAL", "5")
    expect(getTestTotal()).toBe(1000)
    vi.stubEnv("CHECKOUT_TEST_TOTAL", "")
    expect(getTestTotal()).toBe(1000)
    vi.stubEnv("CHECKOUT_TEST_TOTAL", "2500")
    expect(getTestTotal()).toBe(2500)
  })
})
