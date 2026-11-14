import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { checkRateLimit, getClientIp } from "@/utils/rateLimit"
import { QUANTITY_OPTIONS, MESSAGE_MAX, SIGNATURE_MAX } from "@/features/empresas-configurator/tracking"
import { CUSTOM_FRONT_TEXT_MAX } from "@/features/empresas-configurator/frontText"

const RATE_LIMIT_MAX_ATTEMPTS = 40
const RATE_LIMIT_WINDOW_MINUTES = 15
const MAX_THUMB_LENGTH = 150_000 // ~110 KB of image once decoded

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const THUMB_RE = /^data:image\/(webp|png);base64,[A-Za-z0-9+/=]+$/

// Saves the visitor's configurator state so we know who tried it, even if they
// never contact us. Only touches the columns the request actually carries.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, event, logoThumb, message, signature, quantity, neededBy, frontText, frontCustom, logoSize, brandColor, meta } = body ?? {}

    if (typeof id !== "string" || !UUID_RE.test(id)) {
      return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })
    }
    if (event !== "edit" && event !== "cta") {
      return NextResponse.json({ ok: false, error: "INVALID_EVENT" }, { status: 400 })
    }

    const supabase = getSupabase()
    const ip = getClientIp(req)
    const allowed = await checkRateLimit(supabase, `ip:${ip}`, "empresas_maqueta", RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MINUTES)
    if (!allowed) return NextResponse.json({ ok: false, error: "TOO_MANY_ATTEMPTS" }, { status: 429 })

    const row: Record<string, unknown> = { id, updated_at: new Date().toISOString() }

    if (event === "cta") {
      row.cta_clicked_at = new Date().toISOString()
    } else {
      if (logoThumb === null) row.logo_thumb = null
      else if (typeof logoThumb === "string") {
        if (logoThumb.length > MAX_THUMB_LENGTH || !THUMB_RE.test(logoThumb)) {
          return NextResponse.json({ ok: false, error: "INVALID_LOGO" }, { status: 400 })
        }
        row.logo_thumb = logoThumb
      }
      if (typeof message === "string") row.message = message.slice(0, MESSAGE_MAX)
      if (typeof signature === "string") row.signature = signature.slice(0, SIGNATURE_MAX)
      if (typeof frontCustom === "string") row.front_text_custom = frontCustom.slice(0, CUSTOM_FRONT_TEXT_MAX)
      if (typeof quantity === "string" && (quantity === "" || (QUANTITY_OPTIONS as readonly string[]).includes(quantity))) {
        row.quantity = quantity || null
      }
      if (typeof neededBy === "string" && (neededBy === "" || DATE_RE.test(neededBy))) {
        row.needed_by = neededBy || null
      }
      if (typeof frontText === "number" && Number.isInteger(frontText) && frontText >= 0 && frontText < 10) {
        row.front_text = frontText
      }
      if (typeof logoSize === "number" && Number.isInteger(logoSize) && logoSize >= 0 && logoSize < 3) {
        row.logo_size = logoSize
      }
      if (typeof brandColor === "string" && /^#[0-9a-fA-F]{6}$/.test(brandColor)) row.brand_color = brandColor
      if (meta && typeof meta === "object") {
        if (typeof meta.referrer === "string") row.referrer = meta.referrer.slice(0, 300)
        if (meta.device === "mobile" || meta.device === "desktop") row.device = meta.device
        if (meta.utm && typeof meta.utm === "object") {
          const utm: Record<string, string> = {}
          for (const [k, v] of Object.entries(meta.utm as Record<string, unknown>).slice(0, 8)) {
            if (k.startsWith("utm_") && typeof v === "string") utm[k.slice(0, 30)] = v.slice(0, 100)
          }
          row.utm = utm
        }
      }
    }

    const { error } = await supabase.from("empresa_maquetas").upsert(row, { onConflict: "id" })
    if (error) {
      console.error("SUPABASE UPSERT ERROR (empresa_maquetas):", error)
      return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("EMPRESAS MAQUETA ERROR:", err)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 })
  }
}
