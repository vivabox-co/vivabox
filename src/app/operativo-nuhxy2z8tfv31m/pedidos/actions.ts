"use server"

import { getSupabase } from "@/services/supabase"
import { revalidatePath } from "next/cache"
import { PAGE_PATH } from "../types"

export async function markPrepared(formData: FormData) {
  const ventaId = formData.get("ventaId")
  if (typeof ventaId !== "string" || !ventaId) return

  const supabase = getSupabase()

  await supabase
    .from("ventas")
    .update({ prepared_at: new Date().toISOString() })
    .eq("id", ventaId)
    .eq("status", "completed")
    .is("prepared_at", null)

  // Type "layout" : rafraîchit les 3 sous-pages + les compteurs de la nav en
  // un seul appel, plutôt qu'une revalidation par route.
  revalidatePath(PAGE_PATH, "layout")
}

// Désactivation "douce" : on ne supprime jamais la ligne (traçabilité de la
// vente/comptabilité), on la fait juste basculer sur le statut "expired" déjà
// prévu par le schéma. Ça bloque à la fois une future activation (route
// /api/activation/activate exige status="unused") et l'accès si le code était
// déjà activé (route /api/activation/verify exige status="activated").
export async function deactivateCode(formData: FormData) {
  const ventaId = formData.get("ventaId")
  if (typeof ventaId !== "string" || !ventaId) return

  const supabase = getSupabase()

  await supabase
    .from("activation_codes")
    .update({ status: "expired" })
    .eq("venta_id", ventaId)
    .neq("status", "expired")

  revalidatePath(PAGE_PATH, "layout")
}

export async function markShipped(formData: FormData) {
  const ventaId = formData.get("ventaId")
  if (typeof ventaId !== "string" || !ventaId) return

  const supabase = getSupabase()

  await supabase
    .from("ventas")
    .update({ shipped_at: new Date().toISOString() })
    .eq("id", ventaId)
    .eq("status", "completed")
    .not("prepared_at", "is", null)
    .is("shipped_at", null)

  revalidatePath(PAGE_PATH, "layout")
}
