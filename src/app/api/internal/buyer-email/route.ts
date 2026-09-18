import { createHash, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { sendBuyerEmail } from "@/services/buyerEmail"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// "reported" n'est pas exposé : il part du checkout lui-même.
const ALLOWED_KINDS = ["paid", "shipped"] as const
type AllowedKind = (typeof ALLOWED_KINDS)[number]

function hasValidSecret(req: Request) {
  const expected = process.env.INTERNAL_API_SECRET
  const received = req.headers.get("x-internal-secret")

  if (!expected || !received) return false

  // Comparaison sur des hashes : longueur fixe, donc timingSafeEqual ne lève
  // jamais et ne révèle pas la longueur du secret.
  const a = createHash("sha256").update(expected).digest()
  const b = createHash("sha256").update(received).digest()

  return timingSafeEqual(a, b)
}

// Appelée par vivabox-operativo (serveur à serveur) quand l'équipe confirme un
// paiement Bre-B ou marque une box comme expédiée : ces deux événements
// arrivent dans l'autre projet, mais le contenu des emails acheteur vit ici,
// à un seul endroit. Sans INTERNAL_API_SECRET configuré, la route refuse tout.
export async function POST(req: Request) {
  if (!hasValidSecret(req)) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
  }

  try {
    const { ventaId, kind } = await req.json()

    if (typeof ventaId !== "string" || !UUID_RE.test(ventaId)) {
      return NextResponse.json({ ok: false, error: "INVALID_VENTA_ID" }, { status: 400 })
    }

    if (!ALLOWED_KINDS.includes(kind)) {
      return NextResponse.json({ ok: false, error: "INVALID_KIND" }, { status: 400 })
    }

    const sent = await sendBuyerEmail(getSupabase(), ventaId, kind as AllowedKind)

    return NextResponse.json({ ok: true, sent })
  } catch (error) {
    console.error("BUYER EMAIL ROUTE ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 })
  }
}
