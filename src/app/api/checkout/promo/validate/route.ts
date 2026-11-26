import { NextResponse, after } from "next/server"
import { getSupabase } from "@/services/supabase"
import { reportSecurityEvent } from "@/services/securityAlert"
import { isBaitCode } from "@/features/promotions/baitCodes"
import { validatePromoCode } from "@/features/promotions/validatePromoCode"
import { isTestPriceCode } from "@/features/promotions/testPriceCode"
import { checkRateLimits, getClientIp } from "@/utils/rateLimit"

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

    // Le code "prix test" correct n'est jamais limité : le compteur par code
    // est partagé entre tous les appareils et bloquait les vrais tests.
    // Les mauvais codes (devinettes) restent limités plus bas.
    if (isTestPriceCode(code)) {
      return NextResponse.json({ ok: true })
    }

    // Piège : un code appât déclenche une alerte, puis on continue comme pour
    // n'importe quelle devinette (même limite, même réponse INVALID_CODE) —
    // l'attaquant ne doit rien remarquer. Avant le rate limit, sinon un bot
    // déjà bloqué ne déclencherait jamais l'alerte.
    if (isBaitCode(code)) {
      after(() => reportSecurityEvent(supabase, req, "bait_promo_code", code.trim().toUpperCase()))
    }

    // Pas de compteur par code : il laissait n'importe qui bloquer pour tout
    // le monde un code connu (celui d'un influenceur). La devinette reste
    // freinée par IP, puis globalement — l'IP d'abord, pour qu'un client déjà
    // bloqué ne fasse plus monter le compteur global partagé.
    const allowed = await checkRateLimits(supabase, "promo", [
      { identifier: `ip:${ip}`, maxAttempts: RATE_LIMIT_MAX_ATTEMPTS, windowMinutes: RATE_LIMIT_WINDOW_MINUTES },
      { identifier: "global", maxAttempts: GLOBAL_RATE_LIMIT_MAX_ATTEMPTS, windowMinutes: GLOBAL_RATE_LIMIT_WINDOW_MINUTES },
    ])

    if (!allowed) {
      return NextResponse.json({ ok: false, error: "TOO_MANY_ATTEMPTS" })
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
