import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { fetchWompiTransaction, getWompiPublicKey } from "@/services/wompi"
import { finalizeVentaPayment } from "@/features/checkout/finalizeVentaPayment"

// Appelée depuis l'écran de retour après le Widget Wompi — informative pour
// l'utilisateur (feedback rapide), jamais la source de vérité du paiement
// (c'est le webhook /api/checkout/webhook/wompi qui marque la venta payée
// en premier dans l'immense majorité des cas ; cette route ne fait que
// vérifier auprès de Wompi et, si besoin, finalise elle-même en secours).
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { ventaId, transactionId } = body

    if (!ventaId || !transactionId) {
      return NextResponse.json({ ok: false, error: "MISSING_PARAMS" })
    }

    const transaction = await fetchWompiTransaction(transactionId, getWompiPublicKey())

    if (!transaction) {
      return NextResponse.json({ ok: false, error: "TRANSACTION_NOT_FOUND" })
    }

    if (transaction.reference !== ventaId) {
      console.error(`VERIFY: reference mismatch tx=${transactionId} expected=${ventaId} got=${transaction.reference}`)
      return NextResponse.json({ ok: false, error: "REFERENCE_MISMATCH" })
    }

    if (transaction.status === "PENDING") {
      return NextResponse.json({ ok: true, status: "pending" })
    }

    if (transaction.status !== "APPROVED") {
      return NextResponse.json({ ok: true, status: "declined" })
    }

    const supabase = getSupabase()
    const result = await finalizeVentaPayment(supabase, ventaId)

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error })
    }

    return NextResponse.json({ ok: true, status: "approved", activationCode: result.activationCode })

  } catch (error) {
    console.error("VERIFY ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
  }
}
