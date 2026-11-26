import { afterEach, describe, expect, it, vi } from "vitest"
import { isBaitCode } from "./baitCodes"
import { isTestPriceCode } from "./testPriceCode"

describe("isBaitCode", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("matches bait codes ignoring case and surrounding spaces", () => {
    expect(isBaitCode("admin")).toBe(true)
    expect(isBaitCode("  Vivabox100 ")).toBe(true)
  })

  it("does not match real-looking codes", () => {
    expect(isBaitCode("MARIA")).toBe(false)
    expect(isBaitCode("BIENVENIDA-FKWCZ6T8")).toBe(false)
    expect(isBaitCode("")).toBe(false)
  })

  it("never swallows the secret test price code (routes check that first)", () => {
    vi.stubEnv("CHECKOUT_TEST_CODE", "Prueba-9")
    expect(isTestPriceCode("PRUEBA-9")).toBe(true)
    expect(isBaitCode("PRUEBA-9")).toBe(false)
  })
})
