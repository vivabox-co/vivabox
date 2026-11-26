import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createFakeDb, type Handler } from "@/test/fakeDb"
import { MESSAGE_MAX_LENGTH, SIGNATURE_MAX_LENGTH } from "@/features/checkout/personalMessage"

const { dbHolder } = vi.hoisted(() => ({ dbHolder: { client: {} as unknown } }))
vi.mock("@/services/supabase", () => ({ getSupabase: () => dbHolder.client }))

import { POST } from "./route"

function save(payload: unknown) {
  return POST(new Request("http://localhost/api/checkout/message", { method: "POST", body: JSON.stringify(payload) }))
}

async function json(res: Response) {
  return (await res.json()) as Record<string, unknown>
}

function setup(overrides: Record<string, Handler> = {}) {
  const db = createFakeDb({
    "ventas.update": () => ({ data: [{ id: "v1" }] }),
    "ventas.select": () => ({ data: null }),
    ...overrides,
  })
  dbHolder.client = db.client
  return db
}

beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}))
afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("/api/checkout/message", () => {
  it("requires a venta id", async () => {
    const db = setup()
    expect(await json(await save({ mensaje: "hola" }))).toMatchObject({ ok: false, error: "MISSING_VENTA_ID" })
    expect(db.queries).toHaveLength(0)
  })

  it("saves the message with its signature", async () => {
    const db = setup()
    expect(await json(await save({ ventaId: "v1", mensaje: "  Feliz cumple  ", de: " Camilo ♡ " }))).toEqual({ ok: true })
    expect(db.last("ventas", "update")!.payload).toEqual({ message_mensaje: "Feliz cumple", message_de: "Camilo ♡" })
  })

  it("only writes while the message is still empty, and only for paid or transfer-reported ventas", async () => {
    const db = setup()
    await save({ ventaId: "v1", mensaje: "hola", de: "x" })
    const filters = db.last("ventas", "update")!.filters
    expect(filters).toContainEqual(["message_mensaje", "is", null])
    const or = filters.find(([, op]) => op === "or")![2] as string
    expect(or).toContain("status.in.(paid,completed)")
    expect(or).toContain("payment_method.eq.transfer")
  })

  it("truncates the message and the signature to their maximum lengths", async () => {
    const db = setup()
    await save({ ventaId: "v1", mensaje: "a".repeat(MESSAGE_MAX_LENGTH + 100), de: "b".repeat(200) })
    const payload = db.last("ventas", "update")!.payload as { message_mensaje: string; message_de: string }
    expect(payload.message_mensaje).toHaveLength(MESSAGE_MAX_LENGTH)
    expect(payload.message_de).toHaveLength(SIGNATURE_MAX_LENGTH + 2)
  })

  it("writes an empty string for 'continue without message', which also locks it, and drops the signature", async () => {
    const db = setup()
    await save({ ventaId: "v1", mensaje: "   ", de: "Camilo" })
    expect(db.last("ventas", "update")!.payload).toEqual({ message_mensaje: "", message_de: "" })
  })

  it("ignores non-string input", async () => {
    const db = setup()
    await save({ ventaId: "v1", mensaje: { $ne: 1 }, de: 42 })
    expect(db.last("ventas", "update")!.payload).toEqual({ message_mensaje: "", message_de: "" })
  })

  describe("when nothing was updated", () => {
    const none = { "ventas.update": () => ({ data: [] }) }

    it("says NOT_FOUND for an unknown venta", async () => {
      setup({ ...none, "ventas.select": () => ({ data: null }) })
      expect(await json(await save({ ventaId: "v1", mensaje: "x" }))).toMatchObject({ error: "NOT_FOUND" })
    })

    it("says ALREADY_SET when a message was saved before", async () => {
      setup({ ...none, "ventas.select": () => ({ data: { status: "paid", message_mensaje: "antes" } }) })
      expect(await json(await save({ ventaId: "v1", mensaje: "x" }))).toMatchObject({ error: "ALREADY_SET" })
    })

    it("says NOT_PAID when the venta has no confirmed or reported payment", async () => {
      setup({ ...none, "ventas.select": () => ({ data: { status: "reserved", message_mensaje: null } }) })
      expect(await json(await save({ ventaId: "v1", mensaje: "x" }))).toMatchObject({ error: "NOT_PAID" })
    })
  })

  it("answers SERVER_ERROR when saving fails", async () => {
    setup({ "ventas.update": () => ({ error: { message: "down" } }) })
    expect(await json(await save({ ventaId: "v1", mensaje: "x" }))).toMatchObject({ error: "SERVER_ERROR" })
  })
})
