import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createFakeDb, type Handler } from "@/test/fakeDb"
import { hashSessionToken } from "@/utils/sessionToken"

const { dbHolder } = vi.hoisted(() => ({ dbHolder: { client: {} as unknown } }))
vi.mock("@/services/supabase", () => ({ getSupabase: () => dbHolder.client }))

import { POST } from "./route"

const body = { token: "tok-123", experienceCode: " EXP-01 ", requestedDate: "2026-12-20", message: "Hola" }
const future = "2099-01-01T00:00:00Z"

function book(payload: unknown) {
  return POST(new Request("http://localhost/api/activation/bookings", { method: "POST", body: JSON.stringify(payload) }))
}

async function json(res: Response) {
  return (await res.json()) as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

function setup(overrides: Record<string, Handler> = {}) {
  const db = createFakeDb({
    "activation_sessions.select": () => ({ data: { activation_code_id: "code-1", expires_at: future, revoked_at: null } }),
    "activation_codes.select": () => ({ data: { status: "activated" } }),
    "bookings.insert": () => ({ data: { id: "booking-1" } }),
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

describe("/api/activation/bookings", () => {
  it.each([
    ["no token", { ...body, token: "" }],
    ["no experience", { ...body, experienceCode: "  " }],
    ["non-string token", { ...body, token: 42 }],
  ])("rejects %s", async (_label, payload) => {
    const db = setup()
    expect(await json(await book(payload))).toMatchObject({ ok: false, error: "INVALID_INPUT" })
    expect(db.queries).toHaveLength(0)
  })

  it("looks the session up by the hash of the token, never the raw token", async () => {
    const db = setup()
    await book(body)
    expect(db.last("activation_sessions", "select")!.filters).toContainEqual([
      "token_hash",
      "eq",
      hashSessionToken("tok-123"),
    ])
  })

  it.each([
    ["unknown", { data: null }],
    ["revoked", { data: { activation_code_id: "c", expires_at: future, revoked_at: "2026-11-01T00:00:00Z" } }],
    ["expired", { data: { activation_code_id: "c", expires_at: "2020-01-01T00:00:00Z", revoked_at: null } }],
  ])("refuses a %s session and creates no booking", async (_label, session) => {
    const db = setup({ "activation_sessions.select": () => session })
    expect(await json(await book(body))).toMatchObject({ ok: false, error: "INVALID_SESSION" })
    expect(db.last("bookings", "insert")).toBeUndefined()
  })

  it("refuses when the code is not in the activated state", async () => {
    const db = setup({ "activation_codes.select": () => ({ data: { status: "unused" } }) })
    expect(await json(await book(body))).toMatchObject({ ok: false, error: "CANNOT_BOOK" })
    expect(db.last("bookings", "insert")).toBeUndefined()
  })

  it("refuses when the code cannot be found", async () => {
    setup({ "activation_codes.select": () => ({ data: null }) })
    expect(await json(await book(body))).toMatchObject({ ok: false, error: "CANNOT_BOOK" })
  })

  it("creates the booking for the session's own code, with trimmed experience code", async () => {
    const db = setup()
    expect(await json(await book(body))).toEqual({ ok: true, bookingId: "booking-1" })
    expect(db.last("bookings", "insert")!.payload).toEqual({
      activation_code_id: "code-1",
      experience_code: "EXP-01",
      requested_date: "2026-12-20",
      message: "Hola",
    })
  })

  it("ignores any activation code id sent by the client", async () => {
    const db = setup()
    await book({ ...body, activation_code_id: "someone-elses-code" })
    expect(db.last("bookings", "insert")!.payload).toMatchObject({ activation_code_id: "code-1" })
  })

  it("truncates the message to 500 characters", async () => {
    const db = setup()
    await book({ ...body, message: "x".repeat(900) })
    expect((db.last("bookings", "insert")!.payload as { message: string }).message).toHaveLength(500)
  })

  it("reports a second booking for the same code", async () => {
    setup({ "bookings.insert": () => ({ error: { code: "23505" } }) })
    expect(await json(await book(body))).toMatchObject({ ok: false, error: "ALREADY_HAS_BOOKING" })
  })

  it("answers SERVER_ERROR on other insert failures", async () => {
    setup({ "bookings.insert": () => ({ error: { code: "XX000" } }) })
    expect(await json(await book(body))).toMatchObject({ ok: false, error: "SERVER_ERROR" })
  })
})
