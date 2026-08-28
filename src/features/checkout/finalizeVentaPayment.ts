import type { SupabaseClient } from "@supabase/supabase-js"
import { generateActivationCode } from "@/features/activation/generateActivationCode"
import { normalizeCode } from "@/utils/normalizeCode"

const ACTIVATION_VALIDITY_DAYS = 180 // 6 meses desde la compra (docs/01_product.md)
const MAX_CODE_ATTEMPTS = 5
const UNIQUE_VIOLATION = "23505"

export type FinalizeResult =
  | { ok: true; activationCode: string }
  | { ok: false; error: "NOT_FOUND" | "SERVER_ERROR" }

// Appelée à la fois par le webhook Wompi et par la route de vérification
// après redirection — les deux peuvent arriver en même temps pour la même
// venta, donc la transition 'reserved'/'expired' -> 'paid' est atomique
// (WHERE status IN (...)) : un seul appelant "gagne" la course, l'autre
// retombe simplement sur le code déjà généré (idempotent, jamais d'erreur).
export async function finalizeVentaPayment(
  supabase: SupabaseClient,
  ventaId: string
): Promise<FinalizeResult> {
  const { data: updatedRows, error: updateError } = await supabase
    .from("ventas")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", ventaId)
    .in("status", ["reserved", "expired"])
    .select("id, promo_code_input, buyer_email")

  if (updateError) {
    console.error("FINALIZE VENTA UPDATE ERROR:", updateError)
    return { ok: false, error: "SERVER_ERROR" }
  }

  const wonRace = (updatedRows?.length ?? 0) > 0

  if (!wonRace) {
    // Soit la venta n'existe pas, soit un autre appelant vient déjà de la
    // marquer payée (ou complétée) — dans ce dernier cas on renvoie le code
    // existant au lieu d'échouer.
    const { data: existing } = await supabase
      .from("activation_codes")
      .select("code")
      .eq("venta_id", ventaId)
      .maybeSingle()

    if (existing) return { ok: true, activationCode: existing.code }

    const { data: venta } = await supabase
      .from("ventas")
      .select("id")
      .eq("id", ventaId)
      .maybeSingle()

    return venta ? { ok: false, error: "SERVER_ERROR" } : { ok: false, error: "NOT_FOUND" }
  }

  const venta = updatedRows![0]

  // Consomme le code promo choisi à `start`, s'il y en a un. Best-effort :
  // si le code n'est plus valide (rare course avec `start`, ex. plafond
  // atteint entretemps), on logue mais on ne bloque jamais un paiement
  // déjà marqué payé.
  if (venta.promo_code_input) {
    const { data: redeemed, error: redeemError } = await supabase.rpc("redeem_promo_code", {
      p_code: venta.promo_code_input,
      p_venta_id: ventaId,
      p_buyer_email: venta.buyer_email,
    })

    if (redeemError) {
      console.error("PROMO REDEEM ERROR:", redeemError)
    } else if (!redeemed) {
      console.warn(`PROMO REDEEM FAILED (no longer valid): venta=${ventaId} code=${venta.promo_code_input}`)
    }
  }

  const expiresAt = new Date(
    Date.now() + ACTIVATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = generateActivationCode()

    const { error: codeError } = await supabase
      .from("activation_codes")
      .insert({
        venta_id: ventaId,
        code,
        code_normalized: normalizeCode(code),
        expires_at: expiresAt,
      })

    if (!codeError) {
      return { ok: true, activationCode: code }
    }

    if (codeError.code !== UNIQUE_VIOLATION) {
      console.error("ACTIVATION CODE INSERT ERROR:", codeError)
      return { ok: false, error: "SERVER_ERROR" }
    }
  }

  console.error("ACTIVATION CODE GENERATION EXHAUSTED ATTEMPTS")
  return { ok: false, error: "SERVER_ERROR" }
}
