import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { normalizeCode } from "@/utils/normalizeCode"
import { isValidEmail } from "@/utils/isValidEmail"
import { checkRateLimits, getClientIp } from "@/utils/rateLimit"
import { generateSessionToken, hashSessionToken } from "@/utils/sessionToken"

const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MINUTES = 15
// Generous system-wide ceiling: never trips on normal traffic (one attempt
// per real recipient), but stops a sweep spread across rotating IPs/codes
// that would otherwise slip under the per-ip/per-code limits above.
const GLOBAL_RATE_LIMIT_MAX_ATTEMPTS = 100
const GLOBAL_RATE_LIMIT_WINDOW_MINUTES = 10
const SESSION_VALIDITY_DAYS = 7

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const codeInput = typeof body.code === "string" ? body.code : ""
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 100) : ""

    if (!codeInput || !name || !email) {
      return NextResponse.json({ ok: false, error: "INVALID_INPUT" })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "INVALID_EMAIL" })
    }

    const normalizedCode = normalizeCode(codeInput)
    const supabase = getSupabase()
    const ip = getClientIp(req)

    function rejected(error: string) {
      console.warn(`ACTIVATE REJECTED: ${error} ip=${ip} code=${normalizedCode}`)
      return NextResponse.json({ ok: false, error })
    }

    const allowed = await checkRateLimits(supabase, "activate", [
      { identifier: `ip:${ip}`, maxAttempts: RATE_LIMIT_MAX_ATTEMPTS, windowMinutes: RATE_LIMIT_WINDOW_MINUTES },
      { identifier: `code:${normalizedCode}`, maxAttempts: RATE_LIMIT_MAX_ATTEMPTS, windowMinutes: RATE_LIMIT_WINDOW_MINUTES },
      { identifier: "global", maxAttempts: GLOBAL_RATE_LIMIT_MAX_ATTEMPTS, windowMinutes: GLOBAL_RATE_LIMIT_WINDOW_MINUTES },
    ])

    if (!allowed) {
      return rejected("TOO_MANY_ATTEMPTS")
    }

    // Une seule mise à jour conditionnelle, atomique : impossible d'activer
    // deux fois le même code même sous requêtes concurrentes.
    const { data: activated, error: updateError } = await supabase
      .from("activation_codes")
      .update({
        status: "activated",
        beneficiary_name: name,
        beneficiary_email: email,
        activated_at: new Date().toISOString(),
      })
      .eq("code_normalized", normalizedCode)
      .eq("status", "unused")
      .gt("expires_at", new Date().toISOString())
      .select("id")
      .maybeSingle()

    if (updateError) {
      console.error("ACTIVATE UPDATE ERROR:", updateError)
      return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
    }

    if (!activated) {
      const { data: existing } = await supabase
        .from("activation_codes")
        .select("status, expires_at")
        .eq("code_normalized", normalizedCode)
        .maybeSingle()

      if (!existing) {
        return rejected("INVALID_CODE")
      }

      if (existing.status === "activated") {
        return rejected("ALREADY_ACTIVATED")
      }

      if (new Date(existing.expires_at) < new Date()) {
        return rejected("EXPIRED")
      }

      return rejected("INVALID_CODE")
    }

    const token = generateSessionToken()
    const expiresAt = new Date(Date.now() + SESSION_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const { error: sessionError } = await supabase
      .from("activation_sessions")
      .insert({
        activation_code_id: activated.id,
        token_hash: hashSessionToken(token),
        expires_at: expiresAt,
      })

    if (sessionError) {
      console.error("SESSION INSERT ERROR:", sessionError)
      return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
    }

    return NextResponse.json({ ok: true, token, expiresAt })

  } catch (error) {
    console.error("ACTIVATE ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
  }
}
