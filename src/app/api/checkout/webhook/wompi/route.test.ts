import { createHash } from "node:crypto"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { finalizeVentaPayment, finalizeBookingSurplusPayment, sendPaymentFailedAlertEmail } = vi.hoisted(() => ({
  finalizeVentaPayment: vi.fn(),
  finalizeBookingSurplusPayment: vi.fn(),
  sendPaymentFailedAlertEmail: vi.fn(),
}))

vi.mock("@/services/supabase", () => ({ getSupabase: () => ({}) }))
vi.mock("@/features/checkout/finalizeVentaPayment", () => ({ finalizeVentaPayment }))
vi.mock("@/features/checkout/finalizeBookingSurplusPayment", () => ({ finalizeBookingSurplusPayment }))
vi.mock("@/services/email", () => ({ sendPaymentFailedAlertEmail }))

import { POST } from "./route"

const SECRET = "events_secret"
const TIMESTAMP = 1700000000

function signedEvent(transaction: Record<string, unknown>, overrides: Record<string, unknown> = {}) {
  const data = { transaction }
  const properties = ["transaction.id", "transaction.status", "transaction.amount_in_cents"]
  const raw = `${transaction.id}${transaction.status}${transaction.amount_in_cents}${TIMESTAMP}${SECRET}`
  return {
    event: "transaction.updated",
    environment: "prod",
    data,
    timestamp: TIMESTAMP,
    signature: { properties, checksum: createHash("sha256").update(raw).digest("hex") },
    ...overrides,
  }
}

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/checkout/webhook/wompi", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  )
}

const approved = {
  id: "tx-1",
  reference: "venta-123",
  status: "APPROVED",
  amount_in_cents: 5990000,
  currency: "COP",
}

beforeEach(() => {
  vi.stubEnv("WOMPI_EVENTS_SECRET", SECRET)
  vi.stubEnv("NEXT_PUBLIC_WOMPI_PUBLIC_KEY", "pub_prod_abc")
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.spyOn(console, "warn").mockImplementation(() => {})
  finalizeVentaPayment.mockResolvedValue({ ok: true, activationCode: null })
  finalizeBookingSurplusPayment.mockResolvedValue({ ok: true })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("Wompi webhook", () => {
  it("ignores empty or non-JSON bodies without failing", async () => {
    const res = await post("")
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ignored: true })
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it("ignores events that are not transaction.updated", async () => {
    const res = await post(signedEvent(approved, { event: "nequi_token.updated" }))
    expect(res.status).toBe(200)
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it("rejects a bad checksum with 401 and never finalizes", async () => {
    const event = signedEvent(approved)
    event.signature.checksum = "0".repeat(64)
    const res = await post(event)
    expect(res.status).toBe(401)
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it("rejects an event whose amount was altered after signing", async () => {
    const event = signedEvent(approved)
    event.data.transaction = { ...approved, amount_in_cents: 100 }
    const res = await post(event)
    expect(res.status).toBe(401)
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it("never finalizes sandbox events", async () => {
    const res = await post(signedEvent(approved, { environment: "test" }))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ignored: true })
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it("never finalizes when the configured key is a test key", async () => {
    vi.stubEnv("NEXT_PUBLIC_WOMPI_PUBLIC_KEY", "pub_test_abc")
    const res = await post(signedEvent(approved))
    expect(await res.json()).toMatchObject({ ignored: true })
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it("finalizes an approved payment with the amount and currency Wompi reports", async () => {
    const res = await post(signedEvent(approved))
    expect(res.status).toBe(200)
    expect(finalizeVentaPayment).toHaveBeenCalledWith({}, "venta-123", {
      amountInCents: 5990000,
      currency: "COP",
    })
  })

  it("answers 200 on AMOUNT_MISMATCH so Wompi stops retrying", async () => {
    finalizeVentaPayment.mockResolvedValue({ ok: false, error: "AMOUNT_MISMATCH" })
    const res = await post(signedEvent(approved))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ignored: true })
  })

  it("answers 500 when finalizing fails, so Wompi retries", async () => {
    finalizeVentaPayment.mockResolvedValue({ ok: false, error: "SERVER_ERROR" })
    const res = await post(signedEvent(approved))
    expect(res.status).toBe(500)
  })

  it("routes booking-surplus references to the surplus finalizer", async () => {
    const res = await post(signedEvent({ ...approved, reference: "booking-surplus-b42" }))
    expect(res.status).toBe(200)
    expect(finalizeBookingSurplusPayment).toHaveBeenCalledWith({}, "b42")
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it("alerts the team on a declined payment but finalizes nothing", async () => {
    const res = await post(signedEvent({ ...approved, status: "DECLINED" }))
    expect(res.status).toBe(200)
    expect(sendPaymentFailedAlertEmail).toHaveBeenCalledTimes(1)
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it("does not alert on PENDING (it usually becomes APPROVED)", async () => {
    await post(signedEvent({ ...approved, status: "PENDING" }))
    expect(sendPaymentFailedAlertEmail).not.toHaveBeenCalled()
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })
})
