import type { SupabaseClient } from "@supabase/supabase-js"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock("@/services/email", async (orig) => ({
  ...(await orig<typeof import("@/services/email")>()),
  getResend: () => ({ emails: { send } }),
}))

import { sendBuyerEmail } from "./buyerEmail"

type VentaRow = Record<string, unknown>

const base: VentaRow = {
  id: "0a1b2c3d-1111-2222-3333-444455556666",
  status: "paid",
  box_slug: "vivabox",
  quantity: 2,
  buyer_name: "Ana Pérez",
  buyer_email: "ana@example.com",
  total: 398000,
  delivery_type: "physical",
  recipient_name: "Ana Pérez",
  delivery_ciudad: "Medellín",
  shipped_at: null,
  delivery_speed: null,
  paid_at: "2026-11-26T15:00:00Z",
  payment_method: "wompi",
  transfer_reported_at: null,
}

function dbWith(result: { data: VentaRow | null; error?: unknown }) {
  return {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ error: null, ...result }) }) }) }),
  } as unknown as SupabaseClient
}

const venta = (overrides: VentaRow = {}) => dbWith({ data: { ...base, ...overrides } })

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.spyOn(console, "warn").mockImplementation(() => {})
  send.mockResolvedValue({ error: null })
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("sendBuyerEmail — only sends what the real state of the venta allows", () => {
  it.each([
    ["paid", { status: "reserved" }],
    ["paid", { status: "expired" }],
    ["verifying", { status: "paid", payment_method: "transfer" }],
    ["verifying", { status: "reserved", payment_method: "wompi" }],
    ["not_found", { status: "reserved", payment_method: "transfer", transfer_reported_at: "2026-11-26T10:00:00Z" }],
    ["not_found", { status: "reserved", payment_method: null, transfer_reported_at: null }],
    ["shipped", { shipped_at: null }],
  ] as const)("skips %s for %j", async (kind, overrides) => {
    expect(await sendBuyerEmail(venta(overrides), base.id as string, kind)).toBe(false)
    expect(send).not.toHaveBeenCalled()
  })

  it("sends 'paid' for a paid or completed venta", async () => {
    expect(await sendBuyerEmail(venta(), base.id as string, "paid")).toBe(true)
    expect(await sendBuyerEmail(venta({ status: "completed" }), base.id as string, "paid")).toBe(true)
  })

  it("sends 'verifying' while a transfer is under review", async () => {
    const db = venta({ status: "reserved", payment_method: "transfer" })
    expect(await sendBuyerEmail(db, base.id as string, "verifying")).toBe(true)
    expect(send.mock.calls[0][0].subject).toMatch(/verificando/i)
  })

  it("sends 'shipped' once the box has left", async () => {
    expect(await sendBuyerEmail(venta({ shipped_at: "2026-11-27T10:00:00Z" }), base.id as string, "shipped")).toBe(true)
  })
})

describe("sendBuyerEmail — delivery details", () => {
  it("sends to the buyer with the team as reply-to", async () => {
    await sendBuyerEmail(venta(), base.id as string, "paid")
    const [message] = send.mock.calls[0]
    expect(message).toMatchObject({ to: "ana@example.com", replyTo: "contact@vivabox.com.co" })
    expect(message.html).toContain("Hola Ana,")
    expect(message.text).toContain("Total: $398.000 COP")
  })

  it("uses an idempotency key per venta and kind, so a double trigger sends once", async () => {
    await sendBuyerEmail(venta(), base.id as string, "paid")
    expect(send.mock.calls[0][1]).toEqual({ idempotencyKey: `buyer-paid-${base.id}` })
  })

  it("makes the 'not found' key depend on the last report, so a new report can email again", async () => {
    const db = venta({ status: "reserved", payment_method: null, transfer_reported_at: "2026-11-26T10:00:00Z" })
    await sendBuyerEmail(db, base.id as string, "not_found")
    expect(send.mock.calls[0][1].idempotencyKey).toBe(`buyer-not_found-${base.id}-2026-11-26T10:00:00Z`)
  })

  it("escapes HTML coming from buyer-controlled fields", async () => {
    const db = venta({ buyer_name: '<script>alert(1)</script> Ana', shipped_at: "x", recipient_name: '"><img src=x>', delivery_ciudad: "<b>Cali</b>" })
    await sendBuyerEmail(db, base.id as string, "shipped")
    const { html } = send.mock.calls[0][0]
    expect(html).not.toContain("<script>")
    expect(html).not.toContain("<img src=x>")
    expect(html).not.toContain("<b>Cali</b>")
    expect(html).toContain("&lt;b&gt;Cali&lt;/b&gt;")
  })

  it("promises same-day delivery only when the payment arrived on time", async () => {
    const onTime = venta({ delivery_speed: "same_day", paid_at: "2026-11-26T15:00:00Z" }) // Thu 10:00 Bogotá
    await sendBuyerEmail(onTime, base.id as string, "paid")
    expect(send.mock.calls[0][0].text).toMatch(/mismo día/i)

    const late = venta({ delivery_speed: "same_day", paid_at: "2026-11-26T22:00:00Z" }) // 17:00 Bogotá
    await sendBuyerEmail(late, base.id as string, "paid")
    expect(send.mock.calls[1][0].text).toMatch(/después de la hora límite/i)
  })

  it("links the order page for the verifying email and shows the payment reference", async () => {
    const db = venta({ status: "reserved", payment_method: "transfer" })
    await sendBuyerEmail(db, base.id as string, "verifying")
    const { text } = send.mock.calls[0][0]
    expect(text).toContain(`/checkout/success?ventaId=${base.id}&pending=1`)
    expect(text).toContain("Referencia: VB-0A1B2C")
  })
})

describe("sendBuyerEmail — never breaks the caller", () => {
  it("returns false when the venta is missing or the lookup fails", async () => {
    expect(await sendBuyerEmail(dbWith({ data: null }), "x", "paid")).toBe(false)
    expect(await sendBuyerEmail(dbWith({ data: null, error: { message: "down" } }), "x", "paid")).toBe(false)
    expect(send).not.toHaveBeenCalled()
  })

  it("skips an invalid buyer email", async () => {
    expect(await sendBuyerEmail(venta({ buyer_email: "not-an-email" }), base.id as string, "paid")).toBe(false)
    expect(send).not.toHaveBeenCalled()
  })

  it("returns false when Resend reports an error", async () => {
    send.mockResolvedValue({ error: { message: "domain is not verified" } })
    expect(await sendBuyerEmail(venta(), base.id as string, "paid")).toBe(false)
  })

  it("returns false (does not throw) when sending throws", async () => {
    send.mockRejectedValue(new Error("network"))
    await expect(sendBuyerEmail(venta(), base.id as string, "paid")).resolves.toBe(false)
  })
})
