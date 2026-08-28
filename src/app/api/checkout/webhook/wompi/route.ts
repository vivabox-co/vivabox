import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { computeEventChecksum } from "@/services/wompi"
import { finalizeVentaPayment } from "@/features/checkout/finalizeVentaPayment"

// Source de vérité des paiements (docs Wompi : "Do not use the redirection
// as a validation method, ... Wompi will inform you using an Event").
// Configurée dans le Dashboard Wompi comme URL d'événements du comercio.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { event, data, signature, timestamp } = body || {}

    if (
      event !== "transaction.updated" ||
      !data?.transaction ||
      !signature?.properties ||
      !signature?.checksum ||
      typeof timestamp !== "number"
    ) {
      // Événement inconnu ou payload malformé : on répond 200 pour éviter
      // que Wompi ne le retente indéfiniment, mais on ne fait rien.
      return NextResponse.json({ ok: true, ignored: true })
    }

    const expectedChecksum = computeEventChecksum({
      properties: signature.properties,
      data,
      timestamp,
    })

    if (expectedChecksum !== signature.checksum) {
      console.error("WOMPI WEBHOOK: checksum invalide")
      return NextResponse.json({ ok: false, error: "INVALID_SIGNATURE" }, { status: 401 })
    }

    const transaction = data.transaction
    const ventaId = transaction.reference

    if (transaction.status !== "APPROVED") {
      // DECLINED / VOIDED / ERROR / PENDING : rien à faire, la venta reste
      // 'reserved' et peut être retentée (ou expirera via le TTL habituel).
      return NextResponse.json({ ok: true })
    }

    const supabase = getSupabase()
    const result = await finalizeVentaPayment(supabase, ventaId)

    if (!result.ok) {
      console.error(`WOMPI WEBHOOK: finalize failed for venta=${ventaId}`, result.error)
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("WOMPI WEBHOOK ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 })
  }
}
