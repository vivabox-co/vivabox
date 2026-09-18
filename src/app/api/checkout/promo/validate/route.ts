import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { validatePromoCode } from "@/features/promotions/validatePromoCode"
import { isTestPriceCode } from "@/features/promotions/testPriceCode"
import { checkRateLimit, getClientIp } from "@/utils/rateLimit"

const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MINUTES = 15
const GLOBAL_RATE_LIMIT_MAX_ATTEMPTS = 100
const GLOBAL_RATE_LIMIT_WINDOW_MINUTES = 10

// Early, soft check for ProductStep's "Aplicar" button — the buyer's email
// isn't known yet at this point in the funnel, so a welcome code's
// ownership can't be confirmed here. The authoritative check (with email)
// happens in start/route.ts.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const code = typeof body.code === "string" ? body.code : ""

    if (!code.trim()) {
      return NextResponse.json({ ok: false, error: "INVALID_INPUT" })
    }

    const supabase = getSupabase()
    const ip = getClientIp(req)
    const normalized = code.trim().toUpperCase()

    const [ipAllowed, codeAllowed, globalAllowed] = await Promise.all([
      checkRateLimit(supabase, `ip:${ip}`, "promo", RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MINUTES),
      checkRateLimit(supabase, `code:${normalized}`, "promo", RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MINUTES),
      checkRateLimit(supabase, "global", "promo", GLOBAL_RATE_LIMIT_MAX_ATTEMPTS, GLOBAL_RATE_LIMIT_WINDOW_MINUTES),
    ])

    if (!ipAllowed || !codeAllowed || !globalAllowed) {
      return NextResponse.json({ ok: false, error: "TOO_MANY_ATTEMPTS" })
    }

    if (isTestPriceCode(code)) {
      return NextResponse.json({ ok: true })
    }

    const result = await validatePromoCode(supabase, code, null)

    if (!result.valid) {
      return NextResponse.json({ ok: false, error: result.error })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("PROMO VALIDATE ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
  }
}
