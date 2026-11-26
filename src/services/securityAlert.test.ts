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
  vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

describe("reportSecurityEvent", () => {
  it("logs the event and sends one email with a fixed subject", async () => {
    const { client, insert } = fakeSupabase({ rateAllowed: true })
    await reportSecurityEvent(client, req(), "bait_promo_code", "ADMIN")

    expect(insert).toHaveBeenCalledWith({
      kind: "bait_promo_code",
      ip: "1.2.3.4",
      user_agent: "bot/1.0",
      detail: "ADMIN",
    })
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0][0].subject).toBe("🚨 Piège déclenché — code promo")
  })

  it("still logs but skips the email when the IP was already alerted", async () => {
    const { client, insert } = fakeSupabase({ rateAllowed: false })
    await reportSecurityEvent(client, req(), "bait_promo_code", "ADMIN")

    expect(insert).toHaveBeenCalledTimes(1)
    expect(send).not.toHaveBeenCalled()
  })

  it("escapes attacker-controlled input and truncates long values", async () => {
    const { client, insert } = fakeSupabase({ rateAllowed: true })
    await reportSecurityEvent(
      client,
      req({ "user-agent": `<script>alert(1)</script>${"x".repeat(500)}` }),
      "bait_promo_code",
      `<img src=x onerror=1>${"y".repeat(100)}`
    )

    const html: string = send.mock.calls[0][0].html
    expect(html).not.toContain("<script>")
    expect(html).not.toContain("<img")
    expect(html).toContain("&lt;script&gt;")
    expect(insert.mock.calls[0][0].user_agent).toHaveLength(300)
    expect(insert.mock.calls[0][0].detail).toHaveLength(50)
  })

  it("never throws when the table is missing or Resend is down", async () => {
    const { client } = fakeSupabase({ rateAllowed: true, insertError: new Error("no table") })
    send.mockRejectedValue(new Error("resend down"))
    await expect(reportSecurityEvent(client, req(), "bait_promo_code", "ADMIN")).resolves.toBeUndefined()
  })
})
