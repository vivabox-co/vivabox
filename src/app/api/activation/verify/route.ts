import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { normalizeCode } from "@/utils/normalizeCode"
import { isValidEmail } from "@/utils/isValidEmail"
import { checkRateLimits, getClientIp } from "@/utils/rateLimit"
import { generateSessionToken, hashSessionToken } from "@/utils/sessionToken"

const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MINUTES = 15
const GLOBAL_RATE_LIMIT_MAX_ATTEMPTS = 100
const GLOBAL_RATE_LIMIT_WINDOW_MINUTES = 10
const SESSION_VALIDITY_DAYS = 7

// Pour un destinataire déjà activé qui a perdu sa session (nouvel appareil,
// cache vidé...) : redonne un token contre code + email déjà enregistrés.
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const codeInput = typeof body.code === "string" ? body.code : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 100) : ""

    if (!codeInput || !email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "INVALID_INPUT" })
    }

    const normalizedCode = normalizeCode(codeInput)
    const supabase = getSupabase()
    const ip = getClientIp(req)

    function rejected(error: string) {
      console.warn(`VERIFY REJECTED: ${error} ip=${ip} code=${normalizedCode}`)
      return NextResponse.json({ ok: false, error })
    }

    const allowed = await checkRateLimits(supabase, "verify", [
      { identifier: `ip:${ip}`, maxAttempts: RATE_LIMIT_MAX_ATTEMPTS, windowMinutes: RATE_LIMIT_WINDOW_MINUTES },
      { identifier: `code:${normalizedCode}`, maxAttempts: RATE_LIMIT_MAX_ATTEMPTS, windowMinutes: RATE_LIMIT_WINDOW_MINUTES },
      { identifier: "global", maxAttempts: GLOBAL_RATE_LIMIT_MAX_ATTEMPTS, windowMinutes: GLOBAL_RATE_LIMIT_WINDOW_MINUTES },
    ])

    if (!allowed) {
      return rejected("TOO_MANY_ATTEMPTS")
    }

    const { data: activationCode, error: fetchError } = await supabase
      .from("activation_codes")
      .select("id, status, beneficiary_email")
      .eq("code_normalized", normalizedCode)
      .maybeSingle()

    if (fetchError) {
      console.error("VERIFY FETCH ERROR:", fetchError)
      return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
    }

    if (!activationCode) {
      return rejected("INVALID_CODE")
    }

    if (activationCode.status !== "activated") {
      return rejected("NOT_ACTIVATED")
    }

    if (activationCode.beneficiary_email !== email) {
      return rejected("EMAIL_MISMATCH")
    }

    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + SESSION_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const { error: sessionError } = await supabase
      .from("activation_sessions")
      .insert({
        activation_code_id: activationCode.id,
        token_hash: hashSessionToken(token),
        expires_at: expiresAt,
      })

    if (sessionError) {
      console.error("SESSION INSERT ERROR:", sessionError)
      return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
    }

    return NextResponse.json({ ok: true, token, expiresAt })

  } catch (error) {
    console.error("VERIFY ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
  }
}
