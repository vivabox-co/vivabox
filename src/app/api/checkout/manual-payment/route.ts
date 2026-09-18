import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { sendManualPaymentReportEmail } from "@/services/email"
import { paymentReference } from "@/services/manualPayment"
import { checkRateLimit } from "@/utils/rateLimit"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const REPORT_MAX_ATTEMPTS = 3
const REPORT_WINDOW_MINUTES = 60

// Texto libre que escribe el comprador: se limpia antes de guardarlo y de
// meterlo en el email al equipo.
function cleanPayerName(value: unknown): string | null {
  if (typeof value !== "string") return null
  const cleaned = value.replace(/[\x00-\x1f\x7f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80)
  return cleaned || null
}

// Número de aprobación del comprobante Bre-B: solo letras, dígitos y guiones.
function cleanReceiptNumber(value: unknown): string | null {
  if (typeof value !== "string") return null
  const cleaned = value.replace(/[^A-Za-z0-9-]/g, "").slice(0, 40)
  return cleaned || null
}

// Paiement manuel Bre-B (voir services/manualPayment.ts).
//
// - "status" : la page d'attente demande si l'équipe a confirmé le paiement.
// - "report" : l'acheteur dit avoir payé. N'active RIEN : marque seulement la
//   venta payment_method='transfer' (c'est ce qui la fait apparaître dans
//   Pedidos → Pagos du back-office) et alerte l'équipe. Le passage à "paid"
//   et la génération du code d'activation se font uniquement quand l'équipe
//   confirme, après avoir vu l'argent dans Bancolombia.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { ventaId, action } = body

    if (typeof ventaId !== "string" || !UUID_RE.test(ventaId)) {
      return NextResponse.json({ ok: false, error: "MISSING_VENTA_ID" })
    }

    if (action !== "report" && action !== "status") {
      return NextResponse.json({ ok: false, error: "INVALID_ACTION" })
    }

    const supabase = getSupabase()

    const { data: venta, error: fetchError } = await supabase
      .from("ventas")
      .select("id, status, total, box_slug, quantity, buyer_name, buyer_email, buyer_phone, payment_method")
      .eq("id", ventaId)
      .single()

    if (fetchError || !venta) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" })
    }

    if (venta.status === "paid" || venta.status === "completed") {
      return NextResponse.json({ ok: true, status: "paid" })
    }

    if (action === "status") {
      return NextResponse.json({ ok: true, status: "pending" })
    }

    // reserved o expired : una reserva vencida (30 min de Wompi) no impide
    // pagar por transferencia, el back-office acepta ambos estados.
    if (venta.payment_method !== "transfer") {
      const { error: updateError } = await supabase
        .from("ventas")
        .update({ payment_method: "transfer" })
        .eq("id", ventaId)
        .in("status", ["reserved", "expired"])

      if (updateError) {
        console.error("MANUAL PAYMENT UPDATE ERROR:", updateError)
        return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
      }
    }

    const payerName = cleanPayerName(body.payerName)
    const receiptNumber = cleanReceiptNumber(body.receiptNumber)

    // Best-effort y aparte del update de arriba: si las columnas transfer_*
    // aún no existen en la base (migración pendiente), el pago sigue su curso
    // y el equipo igual recibe estos datos en el email.
    const { error: detailsError } = await supabase
      .from("ventas")
      .update({
        transfer_payer_name: payerName,
        transfer_receipt_number: receiptNumber,
        transfer_reported_at: new Date().toISOString(),
      })
      .eq("id", ventaId)
      .in("status", ["reserved", "expired"])

    if (detailsError) {
      console.error("MANUAL PAYMENT DETAILS ERROR:", detailsError)
    }

    const reference = paymentReference(venta.id)

    const allowed = await checkRateLimit(
      supabase,
      `venta:${venta.id}`,
      "manual_payment_report",
      REPORT_MAX_ATTEMPTS,
      REPORT_WINDOW_MINUTES
    )

    if (allowed) {
      await sendManualPaymentReportEmail({
        ventaId: venta.id,
        reference,
        total: venta.total,
        boxSlug: venta.box_slug,
        quantity: venta.quantity,
        buyerName: venta.buyer_name,
        buyerEmail: venta.buyer_email,
        buyerPhone: venta.buyer_phone,
        payerName,
        receiptNumber,
      })
    }

    return NextResponse.json({ ok: true, status: "pending", reference })

  } catch (error) {
    console.error("MANUAL PAYMENT ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
  }
}
