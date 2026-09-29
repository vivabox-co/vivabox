import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { computeEventChecksum } from "@/services/wompi"
import { finalizeVentaPayment } from "@/features/checkout/finalizeVentaPayment"
import { finalizeBookingSurplusPayment } from "@/features/checkout/finalizeBookingSurplusPayment"

// Reference des paiements de "personas extra" démarrés depuis vivabox-appben
// (autre repo, même comercio Wompi — un seul events URL possible par
// comercio, donc ce webhook doit distinguer les deux cas). Voir
// vivabox-appben/lib/utils/bookingSurplusReference.ts.
const BOOKING_SURPLUS_PREFIX = "booking-surplus-"

// Certains outils (dont, semble-t-il, le formulaire "URL de Eventos" du
// Dashboard Wompi) font un GET de vérification avant d'enregistrer l'URL —
// sans ce handler, Next.js répond 405 et l'enregistrement échoue côté Wompi.
export async function GET() {
  return NextResponse.json({ ok: true })
}

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
    const reference = transaction.reference

    if (transaction.status !== "APPROVED") {
      // DECLINED / VOIDED / ERROR / PENDING : rien à faire pour une venta
      // (reste 'reserved', peut être retentée / expirera via le TTL habituel)
      // ni pour un supplément de réservation (reste 'pending', réessayable).
      return NextResponse.json({ ok: true })
    }

    const supabase = getSupabase()

    if (reference.startsWith(BOOKING_SURPLUS_PREFIX)) {
      const bookingId = reference.slice(BOOKING_SURPLUS_PREFIX.length)
      const result = await finalizeBookingSurplusPayment(supabase, bookingId)

      if (!result.ok) {
        console.error(`WOMPI WEBHOOK: booking surplus finalize failed for booking=${bookingId}`, result.error)
        return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
      }

      return NextResponse.json({ ok: true })
    }

    const result = await finalizeVentaPayment(supabase, reference)

    if (!result.ok) {
      console.error(`WOMPI WEBHOOK: finalize failed for venta=${reference}`, result.error)
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("WOMPI WEBHOOK ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 })
  }
}
