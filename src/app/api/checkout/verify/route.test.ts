import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { fetchWompiTransaction, sandboxPaymentsBlocked, finalizeVentaPayment } = vi.hoisted(() => ({
  fetchWompiTransaction: vi.fn(),
  sandboxPaymentsBlocked: vi.fn(),
  finalizeVentaPayment: vi.fn(),
}))

vi.mock("@/services/supabase", () => ({ getSupabase: () => ({}) }))
vi.mock("@/services/wompi", () => ({
  fetchWompiTransaction,
  sandboxPaymentsBlocked,
  getWompiPublicKey: () => "pub_prod_abc",
}))
vi.mock("@/features/checkout/finalizeVentaPayment", () => ({ finalizeVentaPayment }))

import { POST } from "./route"

const tx = { id: "tx-1", reference: "venta-1", status: "APPROVED", amount_in_cents: 5990000, currency: "COP" }

function verify(payload: unknown) {
  return POST(new Request("http://localhost/api/checkout/verify", { method: "POST", body: JSON.stringify(payload) }))
}

async function json(res: Response) {
  return (await res.json()) as Record<string, unknown>
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  sandboxPaymentsBlocked.mockReturnValue(false)
  fetchWompiTransaction.mockResolvedValue(tx)
  finalizeVentaPayment.mockResolvedValue({ ok: true, activationCode: "VIVA-ABCDEFGH" })
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("/api/checkout/verify", () => {
  it("requires both the venta and the transaction id", async () => {
    expect(await json(await verify({ ventaId: "venta-1" }))).toMatchObject({ ok: false, error: "MISSING_PARAMS" })
    expect(await json(await verify({ transactionId: "tx-1" }))).toMatchObject({ ok: false, error: "MISSING_PARAMS" })
    expect(fetchWompiTransaction).not.toHaveBeenCalled()
  })

  it("refuses sandbox payments before calling Wompi", async () => {
    sandboxPaymentsBlocked.mockReturnValue(true)
    expect(await json(await verify({ ventaId: "venta-1", transactionId: "tx-1" }))).toMatchObject({
      ok: false,
      error: "PAYMENTS_UNAVAILABLE",
    })
    expect(fetchWompiTransaction).not.toHaveBeenCalled()
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it("reports an unknown transaction", async () => {
    fetchWompiTransaction.mockResolvedValue(null)
    expect(await json(await verify({ ventaId: "venta-1", transactionId: "nope" }))).toMatchObject({
      ok: false,
      error: "TRANSACTION_NOT_FOUND",
    })
  })

  it("refuses a transaction that belongs to another venta (cannot pay venta A with transaction B)", async () => {
    expect(await json(await verify({ ventaId: "venta-OTHER", transactionId: "tx-1" }))).toMatchObject({
      ok: false,
      error: "REFERENCE_MISMATCH",
    })
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it("answers pending without finalizing", async () => {
    fetchWompiTransaction.mockResolvedValue({ ...tx, status: "PENDING" })
    expect(await json(await verify({ ventaId: "venta-1", transactionId: "tx-1" }))).toEqual({ ok: true, status: "pending" })
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it.each(["DECLINED", "VOIDED", "ERROR"])("answers declined for %s without finalizing", async (status) => {
    fetchWompiTransaction.mockResolvedValue({ ...tx, status })
    expect(await json(await verify({ ventaId: "venta-1", transactionId: "tx-1" }))).toEqual({ ok: true, status: "declined" })
    expect(finalizeVentaPayment).not.toHaveBeenCalled()
  })

  it("finalizes an approved payment with the amount Wompi reports and returns the code", async () => {
    const res = await json(await verify({ ventaId: "venta-1", transactionId: "tx-1" }))
    expect(res).toEqual({ ok: true, status: "approved", activationCode: "VIVA-ABCDEFGH" })
    expect(finalizeVentaPayment).toHaveBeenCalledWith({}, "venta-1", { amountInCents: 5990000, currency: "COP" })
  })

  it("passes the finalize error through (e.g. AMOUNT_MISMATCH)", async () => {
    finalizeVentaPayment.mockResolvedValue({ ok: false, error: "AMOUNT_MISMATCH" })
    expect(await json(await verify({ ventaId: "venta-1", transactionId: "tx-1" }))).toEqual({
      ok: false,
      error: "AMOUNT_MISMATCH",
    })
  })

  it("answers SERVER_ERROR when Wompi cannot be reached", async () => {
    fetchWompiTransaction.mockRejectedValue(new Error("network"))
    expect(await json(await verify({ ventaId: "venta-1", transactionId: "tx-1" }))).toMatchObject({
      ok: false,
      error: "SERVER_ERROR",
    })
  })
})
