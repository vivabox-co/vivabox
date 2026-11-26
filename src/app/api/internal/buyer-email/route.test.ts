import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { sendBuyerEmail } = vi.hoisted(() => ({ sendBuyerEmail: vi.fn() }))
vi.mock("@/services/supabase", () => ({ getSupabase: () => ({}) }))
vi.mock("@/services/buyerEmail", () => ({ sendBuyerEmail }))

import { POST } from "./route"

const ID = "0a1b2c3d-1111-2222-3333-444455556666"

function call(payload: unknown, secret?: string | null) {
  const headers: Record<string, string> = {}
  if (secret) headers["x-internal-secret"] = secret
  return POST(new Request("http://localhost/api/internal/buyer-email", { method: "POST", headers, body: JSON.stringify(payload) }))
}

beforeEach(() => {
  vi.stubEnv("INTERNAL_API_SECRET", "s3cret-value")
  vi.spyOn(console, "error").mockImplementation(() => {})
  sendBuyerEmail.mockResolvedValue(true)
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("/api/internal/buyer-email — authentication", () => {
  it.each([
    ["no secret header", null],
    ["a wrong secret", "wrong"],
    ["a secret differing by one character", "s3cret-valuE"],
    ["a prefix of the secret", "s3cret"],
    ["the secret with extra characters", "s3cret-value-x"],
  ])("answers 401 with %s, and sends nothing", async (_label, secret) => {
    const res = await call({ ventaId: ID, kind: "paid" }, secret)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ ok: false, error: "UNAUTHORIZED" })
    expect(sendBuyerEmail).not.toHaveBeenCalled()
  })

  it("refuses everything when INTERNAL_API_SECRET is not configured, even with an empty header", async () => {
    vi.stubEnv("INTERNAL_API_SECRET", "")
    expect((await call({ ventaId: ID, kind: "paid" }, "")).status).toBe(401)
    expect((await call({ ventaId: ID, kind: "paid" }, "anything")).status).toBe(401)
    expect(sendBuyerEmail).not.toHaveBeenCalled()
  })
})

describe("/api/internal/buyer-email — validation", () => {
  it.each([
    ["no venta id", { kind: "paid" }],
    ["a non-uuid venta id", { ventaId: "1 OR 1=1", kind: "paid" }],
    ["a numeric venta id", { ventaId: 7, kind: "paid" }],
  ])("answers 400 for %s", async (_label, payload) => {
    const res = await call(payload, "s3cret-value")
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: "INVALID_VENTA_ID" })
  })

  it.each(["verifying", "PAID", "", undefined])("answers 400 for kind %j (verifying is sent by the site itself, never on request)", async (kind) => {
    const res = await call({ ventaId: ID, kind }, "s3cret-value")
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: "INVALID_KIND" })
    expect(sendBuyerEmail).not.toHaveBeenCalled()
  })
})

describe("/api/internal/buyer-email — sending", () => {
  it.each(["paid", "shipped", "not_found"])("asks for a '%s' email and reports that it left", async (kind) => {
    const res = await call({ ventaId: ID, kind }, "s3cret-value")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, sent: true })
    expect(sendBuyerEmail).toHaveBeenCalledWith({}, ID, kind)
  })

  it("reports sent:false when the venta's state does not allow that email", async () => {
    sendBuyerEmail.mockResolvedValue(false)
    expect(await (await call({ ventaId: ID, kind: "paid" }, "s3cret-value")).json()).toEqual({ ok: true, sent: false })
  })

  it("answers 500 on a body that is not JSON", async () => {
    const res = await POST(
      new Request("http://localhost/x", { method: "POST", headers: { "x-internal-secret": "s3cret-value" }, body: "nope" })
    )
    expect(res.status).toBe(500)
  })
})
