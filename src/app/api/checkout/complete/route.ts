import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { completeVenta } from "@/features/checkout/completeVenta"

// Le paiement finalise déjà la venta tout seul (finalizeVentaPayment) : cette
// route n'est plus qu'un filet pour le bouton "Continuar" de la page de succès,
// idempotente si la venta est déjà 'completed'.
export async function POST(req: Request) {
  try {
    const { ventaId } = await req.json()

    if (!ventaId) {
      return NextResponse.json({ ok: false, error: "MISSING_VENTA_ID" })
    }

    const result = await completeVenta(getSupabase(), ventaId)

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error("COMPLETE ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
  }
}
