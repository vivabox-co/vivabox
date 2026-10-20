import type { SupabaseClient } from "@supabase/supabase-js"
import { sendOrderReadyEmail } from "@/services/email"

export type CompleteResult =
  | { ok: true }
  | { ok: false; error: "NOT_FOUND" | "NOT_PAID" | "SERVER_ERROR" }

// Passe une venta 'paid' -> 'completed' (c'est ce qui la fait apparaître dans
// Por preparar côté Operativo et déclenche l'alerte push/email de l'équipe).
// Appelée automatiquement à la finalisation du paiement, et par la route
// /api/checkout/complete (bouton "Continuar" de la page de succès) qui n'est
// plus qu'un filet. La transition est atomique (WHERE status = 'paid') : un
// seul appelant l'emporte et envoie le mail équipe, les autres retombent sur
// l'état déjà écrit sans rien refaire.
export async function completeVenta(
  supabase: SupabaseClient,
  ventaId: string
): Promise<CompleteResult> {
  const { data: updatedRows, error: updateError } = await supabase
    .from("ventas")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", ventaId)
    .eq("status", "paid")
    .select("id, box_slug, quantity, buyer_name, buyer_email, delivery_type, recipient_name, recipient_contact, delivery_direccion, delivery_ciudad, delivery_detalles")

  if (updateError) {
    console.error("COMPLETE VENTA UPDATE ERROR:", updateError)
    return { ok: false, error: "SERVER_ERROR" }
  }

  const venta = updatedRows?.[0]

  if (!venta) {
    const { data: existing } = await supabase
      .from("ventas")
      .select("status")
      .eq("id", ventaId)
      .maybeSingle()

    if (!existing) return { ok: false, error: "NOT_FOUND" }
    if (existing.status === "completed") return { ok: true }
    return { ok: false, error: "NOT_PAID" }
  }

  // Pas de code à ce stade pour une box physique (voir finalizeVentaPayment) :
  // l'email le signale ("por asignar"). Best-effort, ne bloque jamais.
  const { data: activationCodeRow } = await supabase
    .from("activation_codes")
    .select("code")
    .eq("venta_id", ventaId)
    .maybeSingle()

  await sendOrderReadyEmail({
    ventaId: venta.id,
    boxSlug: venta.box_slug,
    quantity: venta.quantity,
    buyerName: venta.buyer_name,
    buyerEmail: venta.buyer_email,
    deliveryType: venta.delivery_type,
    activationCode: activationCodeRow?.code ?? null,
    recipientName: venta.recipient_name,
    recipientContact: venta.recipient_contact,
    address: venta.delivery_direccion,
    city: venta.delivery_ciudad,
    addressExtra: venta.delivery_detalles,
  })

  return { ok: true }
}
