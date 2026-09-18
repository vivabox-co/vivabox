import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { sendOrderReadyEmail } from "@/services/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { ventaId, message } = body

    // ======================
    // VALIDATION
    // ======================

    if (!ventaId) {
      return NextResponse.json({ ok: false, error: "MISSING_VENTA_ID" })
    }

    // ======================
    // VENTA LOOKUP
    // ======================

    const supabase = getSupabase()

    const { data: venta, error: fetchError } = await supabase
      .from("ventas")
      .select("id, status")
      .eq("id", ventaId)
      .single()

    if (fetchError || !venta) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" })
    }

    if (venta.status !== "paid") {
      return NextResponse.json({ ok: false, error: "NOT_PAID" })
    }

    // ======================
    // UPDATE
    // ======================

    const { data: updatedVenta, error: updateError } = await supabase
      .from("ventas")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),

        message_para: message?.para || "",
        message_de: message?.de || "",
        message_mensaje: message?.mensaje || "",
      })
      .eq("id", ventaId)
      .select("id, box_slug, quantity, buyer_name, buyer_email, delivery_type, recipient_name, recipient_contact, delivery_direccion, delivery_ciudad, delivery_detalles")
      .single()

    if (updateError || !updatedVenta) {
      console.error("SUPABASE UPDATE ERROR:", updateError)
      return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
    }

    // Notifie l'équipe pour préparer la commande — best-effort, ne bloque
    // jamais la confirmation d'achat même si Resend est indisponible.
    // Pas de code à ce stade pour une box physique (voir finalizeVentaPayment) :
    // l'email le signale ("por asignar") au lieu d'être sauté.
    const { data: activationCodeRow } = await supabase
      .from("activation_codes")
      .select("code")
      .eq("venta_id", ventaId)
      .maybeSingle()

    await sendOrderReadyEmail({
      ventaId: updatedVenta.id,
      boxSlug: updatedVenta.box_slug,
      quantity: updatedVenta.quantity,
      buyerName: updatedVenta.buyer_name,
      buyerEmail: updatedVenta.buyer_email,
      deliveryType: updatedVenta.delivery_type,
      activationCode: activationCodeRow?.code ?? null,
      recipientName: updatedVenta.recipient_name,
      recipientContact: updatedVenta.recipient_contact,
      address: updatedVenta.delivery_direccion,
      city: updatedVenta.delivery_ciudad,
      addressExtra: updatedVenta.delivery_detalles,
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("COMPLETE ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
  }
}
