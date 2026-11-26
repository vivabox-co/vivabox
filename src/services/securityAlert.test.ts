import type { SupabaseClient } from "@supabase/supabase-js"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const send = vi.fn()
vi.mock("resend", () => ({
  Resend: class {
    emails = { send }
  },
}))

import { reportSecurityEvent } from "./securityAlert"

function fakeSupabase(opts: { rateAllowed: boolean; insertError?: unknown }) {
  const insert = vi.fn<(row: Record<string, unknown>) => Promise<{ error: unknown }>>(async () => ({ error: opts.insertError ?? null }))
  const rpc = vi.fn(async () => ({ data: opts.rateAllowed, error: null }))
  const client = { from: vi.fn(() => ({ insert })), rpc }
  return { client: client as unknown as SupabaseClient, insert, rpc }
}

function req(headers: Record<string, string> = {}) {
  return new Request("https://vivabox.test/api", {
    headers: { "x-forwarded-for": "1.2.3.4, 9.9.9.9", "user-agent": "bot/1.0", ...headers },
  })
}

beforeEach(() => {
  send.mockReset()
  send.mockResolvedValue({})
  vi.stubEnv("VERCEL_ENV", "")
  vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("reportSecurityEvent", () => {
  it("logs the full event with app, env and id", async () => {
    const { client, insert } = fakeSupabase({ rateAllowed: true })
    await reportSecurityEvent(client, req(), "bait_promo_code", "ADMIN")

    expect(insert).toHaveBeenCalledWith({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      app: "web",
      env: "dev",
      kind: "bait_promo_code",
      ip: "1.2.3.4",
      user_agent: "bot/1.0",
      detail: "ADMIN",
    })
  })

  it("sends a minimal email that names the app, env, type and a short id", async () => {
    const { client, insert } = fakeSupabase({ rateAllowed: true })
    await reportSecurityEvent(client, req(), "trap_route", "/wp-login.php")

    expect(send).toHaveBeenCalledTimes(1)
    const { subject, html } = send.mock.calls[0][0]
    expect(subject).toBe("🚨 [WEB·DEV] Piège — route piège")

    const shortId = String(insert.mock.calls[0][0].id).slice(0, 8)
    expect(html).toContain(`<strong>ID :</strong> ${shortId}`)
    expect(html).toContain("<strong>App :</strong> web")
    expect(html).toContain("<strong>Environnement :</strong> dev")
  })

  it("keeps everything the attacker controls out of the email", async () => {
    const { client } = fakeSupabase({ rateAllowed: true })
    await reportSecurityEvent(
      client,
      req({ "user-agent": `<script>alert(1)</script>` }),
      "bait_promo_code",
      `<img src=x onerror=1>ADMIN`
    )

    const { subject, html } = send.mock.calls[0][0]
    for (const secret of ["1.2.3.4", "9.9.9.9", "<script>", "alert(1)", "<img", "onerror", "ADMIN"]) {
      expect(html).not.toContain(secret)
      expect(subject).not.toContain(secret)
    }
  })

  it("drops the env tag from the subject in production and keeps it in preview", async () => {
    const { client } = fakeSupabase({ rateAllowed: true })

    vi.stubEnv("VERCEL_ENV", "production")
    await reportSecurityEvent(client, req(), "bait_promo_code", "ADMIN")
    expect(send.mock.calls[0][0].subject).toBe("🚨 [WEB] Piège — code promo appât")

    vi.stubEnv("VERCEL_ENV", "preview")
    await reportSecurityEvent(client, req(), "bait_promo_code", "ADMIN")
    expect(send.mock.calls[1][0].subject).toBe("🚨 [WEB·PREVIEW] Piège — code promo appât")
  })

  it("still logs but skips the email when the IP was already alerted", async () => {
    const { client, insert } = fakeSupabase({ rateAllowed: false })
    await reportSecurityEvent(client, req(), "bait_promo_code", "ADMIN")

    expect(insert).toHaveBeenCalledTimes(1)
    expect(send).not.toHaveBeenCalled()
  })

  it("truncates long attacker values before storing them", async () => {
    const { client, insert } = fakeSupabase({ rateAllowed: true })
    await reportSecurityEvent(
      client,
      req({ "user-agent": "x".repeat(500) }),
      "bait_promo_code",
      "y".repeat(100)
    )

    expect(insert.mock.calls[0][0].user_agent).toHaveLength(300)
    expect(insert.mock.calls[0][0].detail).toHaveLength(50)
  })

  it("never throws when the table is missing or Resend is down", async () => {
    const { client } = fakeSupabase({ rateAllowed: true, insertError: new Error("no table") })
    send.mockRejectedValue(new Error("resend down"))
    await expect(reportSecurityEvent(client, req(), "bait_promo_code", "ADMIN")).resolves.toBeUndefined()
  })
})
