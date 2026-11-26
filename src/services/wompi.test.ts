import { createHash } from "node:crypto"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  checksumMatches,
  computeEventChecksum,
  computeIntegritySignature,
  sandboxPaymentsBlocked,
} from "./wompi"

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex")

beforeEach(() => {
  vi.stubEnv("WOMPI_INTEGRITY_SECRET", "integrity_secret")
  vi.stubEnv("WOMPI_EVENTS_SECRET", "events_secret")
})
afterEach(() => vi.unstubAllEnvs())

describe("computeIntegritySignature", () => {
  it("hashes reference + amount + currency + secret, in that order", () => {
    const sig = computeIntegritySignature({ reference: "ref-1", amountInCents: 5990000, currency: "COP" })
    expect(sig).toBe(sha256("ref-15990000COPintegrity_secret"))
  })

  it("changes when the amount changes (tampering is detectable)", () => {
    const a = computeIntegritySignature({ reference: "r", amountInCents: 100, currency: "COP" })
    const b = computeIntegritySignature({ reference: "r", amountInCents: 101, currency: "COP" })
    expect(a).not.toBe(b)
  })

  it("throws when the secret is missing", () => {
    vi.stubEnv("WOMPI_INTEGRITY_SECRET", "")
    expect(() => computeIntegritySignature({ reference: "r", amountInCents: 1, currency: "COP" })).toThrow()
  })
})

describe("computeEventChecksum", () => {
  const data = { transaction: { id: "tx-1", status: "APPROVED", amount_in_cents: 5990000 } }

  it("concatenates the values pointed by properties, then timestamp, then secret", () => {
    const checksum = computeEventChecksum({
      properties: ["transaction.id", "transaction.status", "transaction.amount_in_cents"],
      data,
      timestamp: 1700000000,
    })
    expect(checksum).toBe(sha256("tx-1APPROVED59900001700000000events_secret"))
  })

  it("treats missing paths as empty strings", () => {
    const checksum = computeEventChecksum({
      properties: ["transaction.id", "transaction.nope.deep"],
      data,
      timestamp: 1,
    })
    expect(checksum).toBe(sha256("tx-11events_secret"))
  })

  it("throws when the events secret is missing", () => {
    vi.stubEnv("WOMPI_EVENTS_SECRET", "")
    expect(() => computeEventChecksum({ properties: [], data, timestamp: 1 })).toThrow()
  })
})

describe("checksumMatches", () => {
  it("accepts an identical checksum", () => {
    expect(checksumMatches("abc", "abc")).toBe(true)
  })
  it("rejects a different checksum", () => {
    expect(checksumMatches("abc", "abd")).toBe(false)
  })
  it("rejects non-string input without throwing", () => {
    expect(checksumMatches("abc", undefined)).toBe(false)
    expect(checksumMatches("abc", 123)).toBe(false)
    expect(checksumMatches("abc", null)).toBe(false)
  })
})

describe("sandboxPaymentsBlocked", () => {
  it("blocks when the key is a test key", () => {
    vi.stubEnv("NEXT_PUBLIC_WOMPI_PUBLIC_KEY", "pub_test_abc")
    expect(sandboxPaymentsBlocked()).toBe(true)
  })

  it("blocks when the key is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_WOMPI_PUBLIC_KEY", "")
    expect(sandboxPaymentsBlocked()).toBe(true)
  })

  it("allows a production key with a production event", () => {
    vi.stubEnv("NEXT_PUBLIC_WOMPI_PUBLIC_KEY", "pub_prod_abc")
    expect(sandboxPaymentsBlocked("prod")).toBe(false)
    expect(sandboxPaymentsBlocked()).toBe(false)
  })

  it("blocks a test event even with a production key", () => {
    vi.stubEnv("NEXT_PUBLIC_WOMPI_PUBLIC_KEY", "pub_prod_abc")
    expect(sandboxPaymentsBlocked("test")).toBe(true)
  })

  it("lets ALLOW_SANDBOX_PAYMENTS=true opt in explicitly", () => {
    vi.stubEnv("NEXT_PUBLIC_WOMPI_PUBLIC_KEY", "pub_test_abc")
    vi.stubEnv("ALLOW_SANDBOX_PAYMENTS", "true")
    expect(sandboxPaymentsBlocked("test")).toBe(false)
  })
})
