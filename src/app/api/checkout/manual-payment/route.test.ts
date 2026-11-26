import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createFakeDb, type Handler } from "@/test/fakeDb"

const { dbHolder, checkRateLimit, sendManualPaymentReportEmail, sendBuyerEmail } = vi.hoisted(() => ({
  dbHolder: { client: {} as unknown },
  checkRateLimit: vi.fn(),
  sendManualPaymentReportEmail: vi.fn(),
  sendBuyerEmail: vi.fn(),
}))

vi.mock("@/services/supabase", () => ({ getSupabase: () => dbHolder.client }))
vi.mock("@/services/email", () => ({ sendManualPaymentReportEmail }))
vi.mock("@/services/buyerEmail", () => ({ sendBuyerEmail }))
vi.mock("@/utils/rateLimit", async (orig) => ({
  ...(await orig<typeof import("@/utils/rateLimit")>()),
  checkRateLimit,
}))

import { POST } from "./route"

const ID = "0a1b2c3d-1111-2222-3333-444455556666"
const reserved = {
  id: ID,
  status: "reserved",
  total: 199000,
  box_slug: "vivabox",
  quantity: 1,
  buyer_name: "Ana",
  buyer_email: "ana@example.com",
  buyer_phone: "300",
  payment_method: null,
  transfer_reported_at: null,
}

function call(payload: unknown) {
  return POST(new Request("http://localhost/api/checkout/manual-payment", { method: "POST", body: JSON.stringify(payload) }))
}

async function json(res: Response) {
  return (await res.json()) as Record<string, unknown>
}

function setup(venta: Record<string, unknown> | null = reserved, overrides: Record<string, Handler> = {}) {
  const db = createFakeDb({
    "ventas.select": () => ({ data: venta }),
    "ventas.update": () => ({}),
    ...overrides,
  })
  dbHolder.client = db.client
  return db
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  checkRateLimit.mockResolvedValue(true)
  sendManualPaymentReportEmail.mockResolvedValue(undefined)
  sendBuyerEmail.mockResolvedValue(undefined)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("/api/checkout/manual-payment — input", () => {
  it.each([
    ["no id", { action: "report" }],
    ["non-uuid id", { ventaId: "1; drop table ventas", action: "report" }],
    ["numeric id", { ventaId: 123, action: "report" }],
  ])("rejects %s", async (_label, payload) => {
    const db = setup()
    expect(await json(await call(payload))).toMatchObject({ ok: false, error: "MISSING_VENTA_ID" })
    expect(db.queries).toHaveLength(0)
  })

  it("rejects an unknown action", async () => {
    setup()
    expect(await json(await call({ ventaId: ID, action: "approve" }))).toMatchObject({ ok: false, error: "INVALID_ACTION" })
  })

  it("reports NOT_FOUND for an unknown venta", async () => {
    setup(null)
    expect(await json(await call({ ventaId: ID, action: "status" }))).toMatchObject({ ok: false, error: "NOT_FOUND" })
  })
})

describe("/api/checkout/manual-payment — status", () => {
  it.each(["paid", "completed"])("says paid for a %s venta, for both actions", async (status) => {
    setup({ ...reserved, status })
    expect(await json(await call({ ventaId: ID, action: "status" }))).toEqual({ ok: true, status: "paid" })
    expect(await json(await call({ ventaId: ID, action: "report" }))).toEqual({ ok: true, status: "paid" })
    expect(sendManualPaymentReportEmail).not.toHaveBeenCalled()
  })

  it("says pending while the team verifies", async () => {
    setup({ ...reserved, payment_method: "transfer", transfer_reported_at: "2026-11-26T10:00:00Z" })
    expect(await json(await call({ ventaId: ID, action: "status" }))).toEqual({ ok: true, status: "pending" })
  })

  it("says rejected when the team cleared the payment method after a report ('No llegó')", async () => {
    setup({ ...reserved, payment_method: null, transfer_reported_at: "2026-11-26T10:00:00Z" })
    expect(await json(await call({ ventaId: ID, action: "status" }))).toEqual({ ok: true, status: "rejected" })
  })

  it("never writes anything for a status check", async () => {
    const db = setup()
    await call({ ventaId: ID, action: "status" })
    expect(db.last("ventas", "update")).toBeUndefined()
  })
})

describe("/api/checkout/manual-payment — report", () => {
  it("marks the venta as a transfer but never as paid", async () => {
    const db = setup()
    const res = await json(await call({ ventaId: ID, action: "report", payerName: "Ana Pérez", receiptNumber: "AB-123" }))

    expect(res).toMatchObject({ ok: true, status: "pending", reference: "VB-0A1B2C" })

    const updates = db.queries.filter((q) => q.action === "update")
    expect(updates[0].payload).toEqual({ payment_method: "transfer" })
    expect(updates.every((q) => !("status" in (q.payload ?? {})))).toBe(true)
    expect(updates.every((q) => q.filters.some(([c, op]) => c === "status" && op === "in"))).toBe(true)
  })

  it("sanitises what the buyer typed before saving and emailing it", async () => {
    const db = setup()
    await call({ ventaId: ID, action: "report", payerName: "Ana\n\t Pérez\u0000   <b>", receiptNumber: "AB 12*3;--" + "9".repeat(80) })
    const details = db.queries.filter((q) => q.action === "update")[1].payload as Record<string, string>
    expect(details.transfer_payer_name).toBe("Ana Pérez <b>")
    expect(details.transfer_receipt_number).toMatch(/^AB123--9+$/)
    expect(details.transfer_receipt_number).toHaveLength(40)
    expect(sendManualPaymentReportEmail).toHaveBeenCalledWith(
      expect.objectContaining({ payerName: "Ana Pérez <b>", receiptNumber: details.transfer_receipt_number })
    )
  })

  it("alerts the team and emails the buyer", async () => {
    setup()
    await call({ ventaId: ID, action: "report" })
    expect(sendManualPaymentReportEmail).toHaveBeenCalledWith(
      expect.objectContaining({ ventaId: ID, reference: "VB-0A1B2C", total: 199000, buyerEmail: "ana@example.com" })
    )
    expect(sendBuyerEmail).toHaveBeenCalledWith(expect.anything(), ID, "verifying")
  })

  it("refuses when the IP is rate limited, before touching the venta", async () => {
    checkRateLimit.mockResolvedValueOnce(false)
    const db = setup()
    expect(await json(await call({ ventaId: ID, action: "report" }))).toMatchObject({ error: "TOO_MANY_ATTEMPTS" })
    expect(db.last("ventas", "update")).toBeUndefined()
    expect(sendManualPaymentReportEmail).not.toHaveBeenCalled()
  })

  it("still answers pending but sends no email once the per-venta limit is hit", async () => {
    checkRateLimit.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    setup()
    expect(await json(await call({ ventaId: ID, action: "report" }))).toMatchObject({ ok: true, status: "pending" })
    expect(sendManualPaymentReportEmail).not.toHaveBeenCalled()
    expect(sendBuyerEmail).not.toHaveBeenCalled()
  })

  it("does not rewrite payment_method when it is already transfer", async () => {
    const db = setup({ ...reserved, payment_method: "transfer" })
    await call({ ventaId: ID, action: "report" })
    const updates = db.queries.filter((q) => q.action === "update")
    expect(updates).toHaveLength(1)
    expect(updates[0].payload).toHaveProperty("transfer_reported_at")
  })

  it("answers SERVER_ERROR when marking the transfer fails, without emailing", async () => {
    setup(reserved, { "ventas.update": () => ({ error: { message: "down" } }) })
    expect(await json(await call({ ventaId: ID, action: "report" }))).toMatchObject({ error: "SERVER_ERROR" })
    expect(sendManualPaymentReportEmail).not.toHaveBeenCalled()
  })
})
