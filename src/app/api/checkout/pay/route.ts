import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { computeIntegritySignature, getWompiPublicKey } from "@/services/wompi"

const RESERVATION_TTL_MS = 30 * 60 * 1000 // 30 min

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { ventaId } = body

    if (!ventaId) {
      return NextResponse.json({ ok: false, error: "MISSING_VENTA_ID" })
    }

    const supabase = getSupabase()

    const { data: venta, error: fetchError } = await supabase
      .from("ventas")
      .select("id, status, created_at, total")
      .eq("id", ventaId)
      .single()

    if (fetchError || !venta) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" })
    }

    if (venta.status === "paid" || venta.status === "completed") {
      return NextResponse.json({ ok: false, error: "ALREADY_PAID" })
    }

    if (venta.status === "expired") {
      return NextResponse.json({ ok: false, error: "RESERVATION_EXPIRED" })
    }

    const age = Date.now() - new Date(venta.created_at).getTime()

    if (age > RESERVATION_TTL_MS) {
      await supabase.from("ventas").update({ status: "expired" }).eq("id", ventaId)
      return NextResponse.json({ ok: false, error: "RESERVATION_EXPIRED" })
    }

    // La reference Wompi est réutilisée à chaque tentative pour une même
    // venta : Wompi l'autorise tant que la tentative précédente n'est pas
    // APPROVED (déclinée/annulée/en attente n'empêche pas de réessayer).
    const reference = venta.id
    const currency = "COP"
    const amountInCents = venta.total * 100

    const signature = computeIntegritySignature({ reference, amountInCents, currency })

    const origin = new URL(req.url).origin
    const redirectUrl = `${origin}/checkout/pago/retorno?ventaId=${venta.id}`

    return NextResponse.json({
      ok: true,
      wompi: {
        publicKey: getWompiPublicKey(),
        currency,
        amountInCents,
        reference,
        signature,
        redirectUrl,
      },
    })

  } catch (error) {
    console.error("PAY ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
  }
}
