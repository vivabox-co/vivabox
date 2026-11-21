import type { SupabaseClient } from "@supabase/supabase-js"

// Wraps the check_rate_limit() Postgres function (supabase/schema.sql):
// atomic counter, one row per (identifier, action), immune to the
// AppScript issue where the rate-limit key was an attacker-supplied email.
export async function checkRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  action: string,
  maxAttempts: number,
  windowMinutes: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_identifier: identifier,
    p_action: action,
    p_max_attempts: maxAttempts,
    p_window_minutes: windowMinutes,
  })

  if (error) {
    console.error("RATE LIMIT CHECK ERROR:", error)
    return true // fail open — a broken rate limiter must never block real traffic
  }

  return data === true
}

export type RateLimitRule = {
  identifier: string
  maxAttempts: number
  windowMinutes: number
}

// Applies several limits in order and stops at the first one exceeded, so a
// request refused by an early rule (per-IP) never increments the later ones
// (global): one blocked client can't exhaust the shared counter and lock
// everyone else out. Put the narrowest rule (per-IP) first.
export async function checkRateLimits(
  supabase: SupabaseClient,
  action: string,
  rules: RateLimitRule[]
): Promise<boolean> {
  for (const rule of rules) {
    const allowed = await checkRateLimit(supabase, rule.identifier, action, rule.maxAttempts, rule.windowMinutes)
    if (!allowed) return false
  }
  return true
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return "unknown"
}
