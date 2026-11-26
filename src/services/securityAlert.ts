import type { SupabaseClient } from "@supabase/supabase-js"
import { sendSecurityAlertEmail } from "@/services/email"
import { checkRateLimit, getClientIp } from "@/utils/rateLimit"

export type SecurityEventKind = "bait_promo_code"

const MAX_DETAIL_LENGTH = 50
const MAX_USER_AGENT_LENGTH = 300

// Un bot qui teste 500 fois ne doit envoyer qu'un seul email par heure.
const ALERT_EMAIL_WINDOW_MINUTES = 60

// Piège déclenché : on journalise TOUJOURS (historique des IP récurrentes),
// mais on n'envoie l'email qu'une fois par IP et par heure. Best-effort : ne
// doit jamais casser le checkout (table absente, Resend en panne…).
export async function reportSecurityEvent(
  supabase: SupabaseClient,
  req: Request,
  kind: SecurityEventKind,
  rawDetail: string
): Promise<void> {
  try {
    const ip = getClientIp(req)
    const userAgent = (req.headers.get("user-agent") ?? "").slice(0, MAX_USER_AGENT_LENGTH)
    const detail = rawDetail.slice(0, MAX_DETAIL_LENGTH)

    const { error } = await supabase.from("security_events").insert({
      kind,
      ip,
      user_agent: userAgent,
      detail,
    })

    if (error) console.error("SECURITY EVENT INSERT ERROR:", error)

    // Échoue ouvert (erreur → true) : au pire un email de trop, jamais une
    // alerte manquée.
    const shouldEmail = await checkRateLimit(supabase, `ip:${ip}`, `security_alert:${kind}`, 1, ALERT_EMAIL_WINDOW_MINUTES)
    // checkRateLimit renvoie true tant que l'appelant est SOUS la limite.
    if (!shouldEmail) return

    await sendSecurityAlertEmail({ kind, ip, userAgent, detail })
  } catch (error) {
    console.error("SECURITY ALERT ERROR:", error)
  }
}
