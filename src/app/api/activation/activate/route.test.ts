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

const body = { code: "viva-ab3d 7xyz", name: "  Luis Gómez ", email: " Luis@Example.COM " }

function activate(payload: unknown, ip = "1.2.3.4") {
  return POST(
    new Request("http://localhost/api/activation/activate", {
      method: "POST",
      headers: { "x-forwarded-for": ip },
      body: JSON.stringify(payload),
    })
  )
}

async function json(res: Response) {
  return (await res.json()) as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

function setup(overrides: Record<string, Handler> = {}) {
  const db = createFakeDb({
    "activation_codes.update": () => ({ data: { id: "code-1" } }),
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
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("/api/activation/activate", () => {
  it.each([
    ["missing code", { ...body, code: "" }, "INVALID_INPUT"],
    ["missing name", { ...body, name: "  " }, "INVALID_INPUT"],
    ["missing email", { ...body, email: undefined }, "INVALID_INPUT"],
    ["non-string code", { ...body, code: 12345 }, "INVALID_INPUT"],
    ["malformed email", { ...body, email: "luis@" }, "INVALID_EMAIL"],
  ])("rejects %s without touching the database", async (_label, payload, error) => {
    const db = setup()
    expect(await json(await activate(payload))).toMatchObject({ ok: false, error })
    expect(db.queries).toHaveLength(0)
  })

  it("rate limits per IP, per code and globally, before any lookup", async () => {
    const db = setup()
    await activate(body, "9.9.9.9")
    const [, action, rules] = checkRateLimits.mock.calls[0]
    expect(action).toBe("activate")
    expect(rules.map((r: { identifier: string }) => r.identifier)).toEqual(["ip:9.9.9.9", "code:VIVAAB3D7XYZ", "global"])
    expect(db.queries.length).toBeGreaterThan(0)
  })

  it("refuses when rate limited and never reads or writes codes", async () => {
    checkRateLimits.mockResolvedValue(false)
    const db = setup()
    expect(await json(await activate(body))).toMatchObject({ ok: false, error: "TOO_MANY_ATTEMPTS" })
    expect(db.queries).toHaveLength(0)
  })

  it("activates with one conditional update: normalized code, status unused, not expired", async () => {
    const db = setup()
    const res = await json(await activate(body))
    expect(res.ok).toBe(true)

    const update = db.last("activation_codes", "update")!
    expect(update.payload).toMatchObject({
      status: "activated",
      beneficiary_name: "Luis Gómez",
      beneficiary_email: "luis@example.com",
    })
    expect(update.filters).toContainEqual(["code_normalized", "eq", "VIVAAB3D7XYZ"])
    expect(update.filters).toContainEqual(["status", "eq", "unused"])
    expect(update.filters.some(([col, op]) => col === "expires_at" && op === "gt")).toBe(true)
  })

  it("returns a session token but stores only its hash", async () => {
    const db = setup()
    const res = await json(await activate(body))
    const stored = db.last("activation_sessions", "insert")!.payload as Record<string, string>

    expect(stored.activation_code_id).toBe("code-1")
    expect(stored.token_hash).toBe(hashSessionToken(res.token))
    expect(JSON.stringify(stored)).not.toContain(res.token)
  })

  it("gives the session a 7 day expiry", async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-26T12:00:00Z"))
    setup()
    const res = await json(await activate(body))
    expect(res.expiresAt).toBe("2026-12-03T12:00:00.000Z")
  })

  describe("when the conditional update matches nothing", () => {
    const noMatch = { "activation_codes.update": () => ({ data: null }) }

    it("reports an unknown code", async () => {
      setup({ ...noMatch, "activation_codes.select": () => ({ data: null }) })
      expect(await json(await activate(body))).toMatchObject({ ok: false, error: "INVALID_CODE" })
    })

    it("reports a code that was already activated", async () => {
      setup({ ...noMatch, "activation_codes.select": () => ({ data: { status: "activated", expires_at: "2099-01-01" } }) })
      expect(await json(await activate(body))).toMatchObject({ ok: false, error: "ALREADY_ACTIVATED" })
    })

    it("reports an expired code", async () => {
      setup({ ...noMatch, "activation_codes.select": () => ({ data: { status: "unused", expires_at: "2020-01-01" } }) })
      expect(await json(await activate(body))).toMatchObject({ ok: false, error: "EXPIRED" })
    })

    it("never creates a session", async () => {
      const db = setup({ ...noMatch, "activation_codes.select": () => ({ data: null }) })
      await activate(body)
      expect(db.last("activation_sessions", "insert")).toBeUndefined()
    })
  })

  it("answers SERVER_ERROR when the update fails", async () => {
    setup({ "activation_codes.update": () => ({ error: { message: "down" } }) })
    expect(await json(await activate(body))).toMatchObject({ ok: false, error: "SERVER_ERROR" })
  })

  it("answers SERVER_ERROR (no token) when the session cannot be stored", async () => {
    setup({ "activation_sessions.insert": () => ({ error: { message: "down" } }) })
    const res = await json(await activate(body))
    expect(res).toMatchObject({ ok: false, error: "SERVER_ERROR" })
    expect(res.token).toBeUndefined()
  })

  it("answers SERVER_ERROR on a body that is not JSON", async () => {
    setup()
    const res = await POST(new Request("http://localhost/x", { method: "POST", body: "nope" }))
    expect(await json(res)).toMatchObject({ ok: false, error: "SERVER_ERROR" })
  })
})
