import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createFakeDb, type Handler } from "@/test/fakeDb"
import { MESSAGE_MAX, SIGNATURE_MAX } from "@/features/empresas-configurator/tracking"
import { CUSTOM_FRONT_TEXT_MAX } from "@/features/empresas-configurator/frontText"

const { dbHolder, checkRateLimit } = vi.hoisted(() => ({
  dbHolder: { client: {} as unknown },
  checkRateLimit: vi.fn(),
}))

vi.mock("@/services/supabase", () => ({ getSupabase: () => dbHolder.client }))
vi.mock("@/utils/rateLimit", async (orig) => ({
  ...(await orig<typeof import("@/utils/rateLimit")>()),
  checkRateLimit,
}))

import { POST } from "./route"

const ID = "0a1b2c3d-1111-2222-3333-444455556666"
const THUMB = "data:image/webp;base64,AAAA"

function track(payload: unknown) {
  return POST(new Request("http://localhost/api/empresas/maqueta", { method: "POST", body: JSON.stringify(payload) }))
}

function setup(overrides: Record<string, Handler> = {}) {
  const db = createFakeDb({ "empresa_maquetas.upsert": () => ({}), ...overrides })
  dbHolder.client = db.client
  return db
}

const saved = (db: ReturnType<typeof setup>) => db.last("empresa_maquetas", "upsert")!.payload as Record<string, unknown>

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  checkRateLimit.mockResolvedValue(true)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("/api/empresas/maqueta — input", () => {
  it.each([
    ["no id", { event: "edit" }],
    ["a non-uuid id", { id: "../../etc", event: "edit" }],
    ["a numeric id", { id: 5, event: "edit" }],
  ])("answers 400 INVALID_ID for %s", async (_label, payload) => {
    const db = setup()
    const res = await track(payload)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: "INVALID_ID" })
    expect(db.queries).toHaveLength(0)
  })

  it("answers 400 INVALID_EVENT for an unknown event", async () => {
    setup()
    const res = await track({ id: ID, event: "delete" })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ ok: false, error: "INVALID_EVENT" })
  })

  it("answers 429 when the IP is rate limited, and writes nothing", async () => {
    checkRateLimit.mockResolvedValue(false)
    const db = setup()
    expect((await track({ id: ID, event: "edit" })).status).toBe(429)
    expect(db.queries).toHaveLength(0)
  })

  it("answers 500 when the upsert fails, and 500 on a non-JSON body", async () => {
    setup({ "empresa_maquetas.upsert": () => ({ error: { message: "down" } }) })
    expect((await track({ id: ID, event: "edit" })).status).toBe(500)
    expect((await POST(new Request("http://localhost/x", { method: "POST", body: "nope" }))).status).toBe(500)
  })
})

describe("/api/empresas/maqueta — cta event", () => {
  it("records the click and nothing else, ignoring edit fields", async () => {
    const db = setup()
    expect(await (await track({ id: ID, event: "cta", message: "hola", logoThumb: THUMB })).json()).toEqual({ ok: true })
    const row = saved(db)
    expect(Object.keys(row).sort()).toEqual(["cta_clicked_at", "id", "updated_at"])
  })
})

describe("/api/empresas/maqueta — edit event", () => {
  it("saves only the fields the request carries", async () => {
    const db = setup()
    await track({ id: ID, event: "edit", message: "Gracias" })
    expect(Object.keys(saved(db)).sort()).toEqual(["id", "message", "updated_at"])
  })

  it("upserts on the id, so repeated edits update the same row", async () => {
    const db = setup()
    await track({ id: ID, event: "edit", message: "a" })
    await track({ id: ID, event: "edit", message: "b" })
    expect(db.queries.filter((q) => q.action === "upsert")).toHaveLength(2)
    expect(saved(db)).toMatchObject({ id: ID, message: "b" })
  })

  it("truncates free text to its limits", async () => {
    const db = setup()
    await track({
      id: ID,
      event: "edit",
      message: "m".repeat(500),
      signature: "s".repeat(500),
      frontCustom: "f".repeat(500),
      meta: { referrer: "r".repeat(900) },
    })
    const row = saved(db)
    expect(row.message).toHaveLength(MESSAGE_MAX)
    expect(row.signature).toHaveLength(SIGNATURE_MAX)
    expect(row.front_text_custom).toHaveLength(CUSTOM_FRONT_TEXT_MAX)
    expect(row.referrer).toHaveLength(300)
  })

  describe("logo thumbnail", () => {
    it("accepts a small webp or png data URL and an explicit null to clear it", async () => {
      const db = setup()
      expect((await track({ id: ID, event: "edit", logoThumb: THUMB })).status).toBe(200)
      expect(saved(db).logo_thumb).toBe(THUMB)
      await track({ id: ID, event: "edit", logoThumb: "data:image/png;base64,iVBOR=" })
      expect(saved(db).logo_thumb).toBe("data:image/png;base64,iVBOR=")
      await track({ id: ID, event: "edit", logoThumb: null })
      expect(saved(db).logo_thumb).toBeNull()
    })

    it.each([
      ["an svg (script carrier)", "data:image/svg+xml;base64,PHN2Zz4="],
      ["a non-image URL", "https://evil.example/x.png"],
      ["a javascript URL", "javascript:alert(1)"],
      ["a gif", "data:image/gif;base64,AAAA"],
      ["an oversized image", "data:image/webp;base64," + "A".repeat(150_001)],
    ])("rejects %s with 400, writing nothing", async (_label, logoThumb) => {
      const db = setup()
      const res = await track({ id: ID, event: "edit", logoThumb })
      expect(res.status).toBe(400)
      expect(await res.json()).toEqual({ ok: false, error: "INVALID_LOGO" })
      expect(db.queries.filter((q) => q.action === "upsert")).toHaveLength(0)
    })
  })

  describe("closed-set and format fields", () => {
    it("accepts a known quantity, an empty one (cleared) and a date", async () => {
      const db = setup()
      await track({ id: ID, event: "edit", quantity: "26 a 50", neededBy: "2026-12-15" })
      expect(saved(db)).toMatchObject({ quantity: "26 a 50", needed_by: "2026-12-15" })
      await track({ id: ID, event: "edit", quantity: "", neededBy: "" })
      expect(saved(db)).toMatchObject({ quantity: null, needed_by: null })
    })

    it("silently drops invalid values instead of storing them", async () => {
      const db = setup()
      await track({
        id: ID,
        event: "edit",
        quantity: "9999 cajas",
        neededBy: "mañana",
        frontText: 10,
        logoSize: 3,
        brandColor: "red",
        message: 12,
      })
      expect(Object.keys(saved(db)).sort()).toEqual(["id", "updated_at"])
    })

    it("accepts in-range integers and a #rrggbb color", async () => {
      const db = setup()
      await track({ id: ID, event: "edit", frontText: 0, logoSize: 2, brandColor: "#A1b2C3" })
      expect(saved(db)).toMatchObject({ front_text: 0, logo_size: 2, brand_color: "#A1b2C3" })
    })

    it("rejects non-integer and negative numbers", async () => {
      const db = setup()
      await track({ id: ID, event: "edit", frontText: 1.5, logoSize: -1 })
      expect(saved(db)).not.toHaveProperty("front_text")
      expect(saved(db)).not.toHaveProperty("logo_size")
    })
  })

  describe("meta", () => {
    it("keeps the device only when it is mobile or desktop", async () => {
      const db = setup()
      await track({ id: ID, event: "edit", meta: { device: "mobile" } })
      expect(saved(db).device).toBe("mobile")
      await track({ id: ID, event: "edit", meta: { device: "toaster" } })
      expect(saved(db)).not.toHaveProperty("device")
    })

    it("keeps only utm_ keys, truncates them, and caps the count at 8", async () => {
      const db = setup()
      const utm: Record<string, unknown> = { utm_source: "g".repeat(300), other: "x", utm_num: 5 }
      for (let i = 0; i < 12; i++) utm[`utm_k${i}`] = "v"
      await track({ id: ID, event: "edit", meta: { utm } })
      const stored = saved(db).utm as Record<string, string>
      expect(stored.utm_source).toHaveLength(100)
      expect(stored).not.toHaveProperty("other")
      expect(stored).not.toHaveProperty("utm_num")
      expect(Object.keys(stored).length).toBeLessThanOrEqual(8)
    })
  })
})
