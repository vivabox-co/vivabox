import type { SupabaseClient } from "@supabase/supabase-js"

export type FinalizeSurplusResult =
  | { ok: true }
  | { ok: false; error: "NOT_FOUND" | "SERVER_ERROR" }

// Pendant de finalizeVentaPayment.ts pour le paiement des "personas extra"
// d'une réservation (vivabox-appben, autre repo — même projet Supabase).
// Appelée à la fois par le webhook Wompi (ci-dessous) et par vivabox-appben
// (POST /api/booking/[bookingId]/verify-payment) : la transition
// 'pending' -> 'paid' est WHERE status='pending', donc idempotente — le
// premier appelant "gagne", l'autre ne touche aucune ligne sans que ce soit
// une erreur.
export async function finalizeBookingSurplusPayment(
  supabase: SupabaseClient,
  bookingId: string
): Promise<FinalizeSurplusResult> {
  const { data: updatedRows, error: updateError } = await supabase
    .from("bookings")
    .update({ extra_payment_status: "paid", extra_paid_at: new Date().toISOString() })
    .eq("id", bookingId)
    .eq("extra_payment_status", "pending")
    .select("id")

  if (updateError) {
    console.error("FINALIZE BOOKING SURPLUS UPDATE ERROR:", updateError)
    return { ok: false, error: "SERVER_ERROR" }
  }

  if ((updatedRows?.length ?? 0) > 0) return { ok: true }

  // Soit déjà payé (l'autre appelant a gagné la course — pas une erreur),
  // soit la réservation n'existe pas : on distingue les deux pour logger
  // uniquement le cas anormal.
  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .maybeSingle()

  return booking ? { ok: true } : { ok: false, error: "NOT_FOUND" }
}
