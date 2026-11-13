import { NextResponse } from "next/server"
import { getSupabase } from "@/services/supabase"
import { MESSAGE_MAX_LENGTH, SIGNATURE_MAX_LENGTH } from "@/features/checkout/personalMessage"

// Le message personnel s'écrit une seule fois : la ligne n'est mise à jour que
// tant que message_mensaje est NULL. Un envoi sans texte ("Continuar sin
// mensaje") écrit une chaîne vide, ce qui verrouille aussi.
//
// Il s'écrit une fois la venta payée, OU pendant que l'équipe vérifie un
// paiement Bre-B (reserved/expired + payment_method 'transfer', ou déjà signalé
// puis écarté par "No llegó" : transfer_reported_at reste) : le client n'a pas
// à attendre la confirmation, et son message n'est pas perdu si l'équipe ne
// retrouve pas le paiement. Le message reste sur la venta quand elle
// passe à 'paid' (aucune transition ne touche message_*).
export async function POST(req: Request) {
  try {
    const { ventaId, mensaje, de } = await req.json()

    if (!ventaId || typeof ventaId !== "string") {
      return NextResponse.json({ ok: false, error: "MISSING_VENTA_ID" })
    }

    const text = typeof mensaje === "string" ? mensaje.trim().slice(0, MESSAGE_MAX_LENGTH) : ""
    const signature = typeof de === "string" ? de.trim().slice(0, SIGNATURE_MAX_LENGTH + 2) : ""

    const supabase = getSupabase()

    const { data: updated, error } = await supabase
      .from("ventas")
      .update({ message_mensaje: text, message_de: text ? signature : "" })
      .eq("id", ventaId)
      .or("status.in.(paid,completed),and(status.in.(reserved,expired),or(payment_method.eq.transfer,transfer_reported_at.not.is.null))")
      .is("message_mensaje", null)
      .select("id")

    if (error) {
      console.error("MESSAGE SAVE ERROR:", error)
      return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
    }

    if (!updated?.length) {
      const { data: existing } = await supabase
        .from("ventas")
        .select("status, message_mensaje")
        .eq("id", ventaId)
        .maybeSingle()

      if (!existing) return NextResponse.json({ ok: false, error: "NOT_FOUND" })
      if (existing.message_mensaje !== null) return NextResponse.json({ ok: false, error: "ALREADY_SET" })
      return NextResponse.json({ ok: false, error: "NOT_PAID" })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("MESSAGE ERROR:", error)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" })
  }
}
