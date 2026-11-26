import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createFakeDb, type Handler } from "@/test/fakeDb"
import { hashSessionToken } from "@/utils/sessionToken"

const { dbHolder, checkRateLimits } = vi.hoisted(() => ({
  dbHolder: { client: {} as unknown },
  checkRateLimits: vi.fn(),
}))

vi.mock("@/services/supabase", () => ({ getSupabase: () => dbHolder.client }))
vi.mock("@/utils/rateLimit", async (orig) => ({
  ...(await orig<typeof import("@/utils/rateLimit")>()),
  checkRateLimits,
}))

import { POST } from "./route"

const body = { code: "viva-ab3d7xyz", email: "Luis@Example.com" }
const activatedFor = (email: string) => ({ data: { id: "code-1", status: "activated", beneficiary_email: email } })

function verify(payload: unknown) {
  return POST(new Request("http://localhost/api/activation/verify", { method: "POST", body: JSON.stringify(payload) }))
}

async function json(res: Response) {
  return (await res.json()) as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

function setup(overrides: Record<string, Handler> = {}) {
  const db = createFakeDb({
    "activation_codes.select": () => activatedFor("luis@example.com"),
    "activation_sessions.insert": () => ({}),
    ...overrides,
  })
  dbHolder.client = db.client
  return db
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.spyOn(console, "warn").mockImplementation(() => {})
  checkRateLimits.mockResolvedValue(true)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("/api/activation/verify", () => {
  it.each([
    ["missing code", { ...body, code: "" }],
    ["missing email", { ...body, email: "" }],
    ["malformed email", { ...body, email: "luis@" }],
  ])("rejects %s", async (_label, payload) => {
    const db = setup()
    expect(await json(await verify(payload))).toMatchObject({ ok: false, error: "INVALID_INPUT" })
    expect(db.queries).toHaveLength(0)
  })

  it("refuses when rate limited, before reading the code", async () => {
    checkRateLimits.mockResolvedValue(false)
    const db = setup()
    expect(await json(await verify(body))).toMatchObject({ ok: false, error: "TOO_MANY_ATTEMPTS" })
    expect(db.queries).toHaveLength(0)
  })

  it("looks the code up in normalized form", async () => {
    const db = setup()
    await verify(body)
    expect(db.last("activation_codes", "select")!.filters).toContainEqual(["code_normalized", "eq", "VIVAAB3D7XYZ"])
  })

  it("reports an unknown code", async () => {
    setup({ "activation_codes.select": () => ({ data: null }) })
    expect(await json(await verify(body))).toMatchObject({ ok: false, error: "INVALID_CODE" })
  })

  it("refuses a code nobody has activated yet", async () => {
    setup({ "activation_codes.select": () => ({ data: { id: "c", status: "unused", beneficiary_email: null } }) })
    expect(await json(await verify(body))).toMatchObject({ ok: false, error: "NOT_ACTIVATED" })
  })

  it("refuses another person's email, and issues no session", async () => {
    const db = setup({ "activation_codes.select": () => activatedFor("someone.else@example.com") })
    expect(await json(await verify(body))).toMatchObject({ ok: false, error: "EMAIL_MISMATCH" })
    expect(db.last("activation_sessions", "insert")).toBeUndefined()
  })

  it("issues a new session for the registered email, whatever its casing", async () => {
    const db = setup()
    const res = await json(await verify(body))
    expect(res.ok).toBe(true)
    const stored = db.last("activation_sessions", "insert")!.payload as Record<string, string>
    expect(stored.activation_code_id).toBe("code-1")
    expect(stored.token_hash).toBe(hashSessionToken(res.token))
    expect(JSON.stringify(stored)).not.toContain(res.token)
  })

  it("answers SERVER_ERROR when the lookup or the session insert fails", async () => {
    setup({ "activation_codes.select": () => ({ error: { message: "down" } }) })
    expect(await json(await verify(body))).toMatchObject({ ok: false, error: "SERVER_ERROR" })

    setup({ "activation_sessions.insert": () => ({ error: { message: "down" } }) })
    const res = await json(await verify(body))
    expect(res).toMatchObject({ ok: false, error: "SERVER_ERROR" })
    expect(res.token).toBeUndefined()
  })
})
