import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createFakeDb, type Handler } from "@/test/fakeDb"

const { dbHolder, checkRateLimit, sendPartnerLeadEmail } = vi.hoisted(() => ({
  dbHolder: { client: {} as unknown },
  checkRateLimit: vi.fn(),
  sendPartnerLeadEmail: vi.fn(),
}))

vi.mock("@/services/supabase", () => ({ getSupabase: () => dbHolder.client }))
vi.mock("@/services/email", () => ({ sendPartnerLeadEmail }))
vi.mock("@/utils/rateLimit", async (orig) => ({
  ...(await orig<typeof import("@/utils/rateLimit")>()),
  checkRateLimit,
}))

import { POST } from "./route"

const valid = {
  name: " Camila Ruiz ",
  company: "Finca La Esperanza",
  location: "Guatavita",
  whatsapp: "+57 300 123 4567",
  email: "camila@example.com",
  category: "Naturaleza & aventura",
  experienceName: " Cabalgata al amanecer ",
  experienceDescription: "  Dos horas a caballo  ",
  websiteOrInstagram: "@laesperanza",
}

function submit(payload: unknown) {
  return POST(new Request("http://localhost/api/aliados/submit", { method: "POST", body: JSON.stringify(payload) }))
}

async function json(res: Response) {
  return (await res.json()) as Record<string, unknown>
}

function setup(overrides: Record<string, Handler> = {}) {
  const db = createFakeDb({ "partner_leads.insert": () => ({ data: { id: "lead-1" } }), ...overrides })
  dbHolder.client = db.client
  return db
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  checkRateLimit.mockResolvedValue(true)
  sendPartnerLeadEmail.mockResolvedValue(undefined)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("/api/aliados/submit — validation", () => {
  it.each([
    ["name", { name: " " }, "MISSING_NAME"],
    ["company", { company: undefined }, "MISSING_COMPANY"],
    ["location", { location: "" }, "MISSING_LOCATION"],
    ["any contact", { whatsapp: "", email: "" }, "MISSING_CONTACT"],
    ["a valid whatsapp", { whatsapp: "123" }, "INVALID_WHATSAPP"],
    ["a valid email", { email: "camila@" }, "INVALID_EMAIL"],
    ["a known category", { category: "Hackers" }, "INVALID_CATEGORY"],
    ["an experience name", { experienceName: "  " }, "MISSING_EXPERIENCE_NAME"],
  ])("requires %s", async (_label, overrides, error) => {
    const db = setup()
    expect(await json(await submit({ ...valid, ...overrides }))).toMatchObject({ ok: false, error })
    expect(db.queries).toHaveLength(0)
    expect(sendPartnerLeadEmail).not.toHaveBeenCalled()
  })

  it("accepts a lead with only a whatsapp, or only an email", async () => {
    setup()
    expect(await json(await submit({ ...valid, email: "" }))).toEqual({ ok: true })
    expect(await json(await submit({ ...valid, whatsapp: "" }))).toEqual({ ok: true })
  })
})

describe("/api/aliados/submit — honeypot and rate limit", () => {
  it("pretends success for a bot that filled the hidden field, but stores and emails nothing", async () => {
    const db = setup()
    expect(await json(await submit({ ...valid, website: "http://spam.example" }))).toEqual({ ok: true })
    expect(db.queries).toHaveLength(0)
    expect(sendPartnerLeadEmail).not.toHaveBeenCalled()
    expect(checkRateLimit).not.toHaveBeenCalled()
  })

  it("ignores a blank honeypot (real humans leave it empty)", async () => {
    const db = setup()
    await submit({ ...valid, website: "   " })
    expect(db.last("partner_leads", "insert")).toBeDefined()
  })

  it("refuses when the IP is rate limited, before inserting or emailing", async () => {
    checkRateLimit.mockResolvedValue(false)
    const db = setup()
    expect(await json(await submit(valid))).toMatchObject({ ok: false, error: "TOO_MANY_ATTEMPTS" })
    expect(db.queries).toHaveLength(0)
    expect(sendPartnerLeadEmail).not.toHaveBeenCalled()
  })
})

describe("/api/aliados/submit — saving", () => {
  it("stores the trimmed lead and emails the team with the new lead id", async () => {
    const db = setup()
    expect(await json(await submit(valid))).toEqual({ ok: true })

    expect(db.last("partner_leads", "insert")!.payload).toEqual({
      name: "Camila Ruiz",
      company: "Finca La Esperanza",
      location: "Guatavita",
      whatsapp: "+57 300 123 4567",
      email: "camila@example.com",
      category: "Naturaleza & aventura",
      experience_name: "Cabalgata al amanecer",
      experience_description: "Dos horas a caballo",
      website_or_instagram: "@laesperanza",
    })
    expect(sendPartnerLeadEmail).toHaveBeenCalledWith(expect.objectContaining({ leadId: "lead-1", name: "Camila Ruiz" }))
  })

  it("stores optional fields as null rather than empty strings", async () => {
    const db = setup()
    await submit({ ...valid, email: "", experienceDescription: "  ", websiteOrInstagram: undefined })
    expect(db.last("partner_leads", "insert")!.payload).toMatchObject({
      email: null,
      experience_description: null,
      website_or_instagram: null,
    })
  })

  it("answers SERVER_ERROR and sends no email when the insert fails", async () => {
    setup({ "partner_leads.insert": () => ({ error: { message: "down" } }) })
    expect(await json(await submit(valid))).toMatchObject({ ok: false, error: "SERVER_ERROR" })
    expect(sendPartnerLeadEmail).not.toHaveBeenCalled()
  })

  it("answers SERVER_ERROR on a body that is not JSON", async () => {
    setup()
    const res = await POST(new Request("http://localhost/x", { method: "POST", body: "nope" }))
    expect(await json(res)).toMatchObject({ ok: false, error: "SERVER_ERROR" })
  })
})
