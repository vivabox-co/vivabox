import type { SupabaseClient } from "@supabase/supabase-js"
import { afterEach, describe, expect, it, vi } from "vitest"
import { generateCode } from "./generateCode"
import { isValidEmail } from "./isValidEmail"
import { normalizeCode } from "./normalizeCode"
import { checkRateLimit, checkRateLimits, getClientIp } from "./rateLimit"
import { generateSessionToken, hashSessionToken } from "./sessionToken"

describe("normalizeCode", () => {
  it("makes differently typed codes comparable", () => {
    expect(normalizeCode("viva-ab3d7")).toBe("VIVAAB3D7")
    expect(normalizeCode(" VIVA AB3D7 ")).toBe("VIVAAB3D7")
  })
  it("handles empty input", () => {
    expect(normalizeCode("")).toBe("")
    expect(normalizeCode(undefined as unknown as string)).toBe("")
  })
})

describe("generateCode", () => {
  it("uses the prefix and a suffix without ambiguous characters", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateCode("VIVA")).toMatch(/^VIVA-[A-HJ-NP-Z2-9]{5}$/)
    }
  })
  it("respects the requested length", () => {
    expect(generateCode("X", 8)).toMatch(/^X-[A-HJ-NP-Z2-9]{8}$/)
  })
})

describe("session tokens", () => {
  it("generates unique url-safe tokens", () => {
    const a = generateSessionToken()
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(generateSessionToken()).not.toBe(a)
  })
  it("stores only a deterministic hash that differs from the token", () => {
    const token = generateSessionToken()
    expect(hashSessionToken(token)).toBe(hashSessionToken(token))
    expect(hashSessionToken(token)).not.toBe(token)
    expect(hashSessionToken(token)).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe("isValidEmail", () => {
  it("accepts normal emails and rejects obvious garbage", () => {
    expect(isValidEmail("ana@example.com")).toBe(true)
    expect(isValidEmail("ana@example")).toBe(false)
    expect(isValidEmail("ana example@x.co")).toBe(false)
    expect(isValidEmail("")).toBe(false)
  })
})

describe("rate limiting", () => {
  afterEach(() => vi.restoreAllMocks())

  const clientReturning = (results: Array<{ data: unknown; error: unknown }>) => {
    const rpc = vi.fn()
    results.forEach((r) => rpc.mockResolvedValueOnce(r))
    return { client: { rpc } as unknown as SupabaseClient, rpc }
  }

  it("fails open when the limiter itself errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const { client } = clientReturning([{ data: null, error: new Error("down") }])
    expect(await checkRateLimit(client, "ip", "pay", 5, 10)).toBe(true)
  })

  it("stops at the first exceeded rule so later counters are not incremented", async () => {
    const { client, rpc } = clientReturning([
      { data: false, error: null },
      { data: true, error: null },
    ])
    const allowed = await checkRateLimits(client, "pay", [
      { identifier: "ip:1.2.3.4", maxAttempts: 5, windowMinutes: 10 },
      { identifier: "global", maxAttempts: 100, windowMinutes: 10 },
    ])
    expect(allowed).toBe(false)
    expect(rpc).toHaveBeenCalledTimes(1)
  })

  it("allows when every rule passes", async () => {
    const { client, rpc } = clientReturning([
      { data: true, error: null },
      { data: true, error: null },
    ])
    const allowed = await checkRateLimits(client, "pay", [
      { identifier: "a", maxAttempts: 1, windowMinutes: 1 },
      { identifier: "b", maxAttempts: 1, windowMinutes: 1 },
    ])
    expect(allowed).toBe(true)
    expect(rpc).toHaveBeenCalledTimes(2)
  })

  it("reads the client IP from the first x-forwarded-for entry", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } })
    expect(getClientIp(req)).toBe("1.2.3.4")
    expect(getClientIp(new Request("http://x"))).toBe("unknown")
  })
})
