import { getSupabase } from "@/services/supabase"
import { Order, HISTORY_LIMIT } from "./types"
import { getReservasCounts } from "./reservas/data"

async function attachCodes<T extends { id: string }>(ventas: T[]): Promise<(T & { code: string | null })[]> {
  if (!ventas.length) return []

  const supabase = getSupabase()
  const { data: codes } = await supabase
    .from("activation_codes")
    .select("venta_id, code")
    .in("venta_id", ventas.map((v) => v.id))

  const codeByVenta = new Map((codes || []).map((c) => [c.venta_id, c.code]))

  return ventas.map((v) => ({ ...v, code: codeByVenta.get(v.id) ?? null }))
}

const ORDER_FIELDS =
  "id, created_at, box_slug, quantity, buyer_name, buyer_email, recipient_name, recipient_contact, delivery_direccion, delivery_ciudad, delivery_detalles, prepared_at, shipped_at"

export async function getToPrepare(): Promise<Order[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("ventas")
    .select(ORDER_FIELDS)
    .eq("status", "completed")
    .is("prepared_at", null)
    .is("shipped_at", null)
    .order("created_at", { ascending: true })

  if (error) throw error
  return attachCodes(data)
}

export async function getToShip(): Promise<Order[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("ventas")
    .select(ORDER_FIELDS)
    .eq("status", "completed")
    .not("prepared_at", "is", null)
    .is("shipped_at", null)
    .order("prepared_at", { ascending: true })

  if (error) throw error
  return attachCodes(data)
}

export async function getHistory(): Promise<Order[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("ventas")
    .select(ORDER_FIELDS)
    .eq("status", "completed")
    .not("shipped_at", "is", null)
    .order("shipped_at", { ascending: false })
    .limit(HISTORY_LIMIT)

  if (error) throw error
  return attachCodes(data)
}

// Comptes légers pour les badges de la bottom nav — pas besoin de rapatrier
// les lignes complètes ici.
export async function getCounts() {
  const supabase = getSupabase()

  const [toPrepare, toShip, reservas] = await Promise.all([
    supabase.from("ventas").select("id", { count: "exact", head: true })
      .eq("status", "completed").is("prepared_at", null).is("shipped_at", null),
    supabase.from("ventas").select("id", { count: "exact", head: true })
      .eq("status", "completed").not("prepared_at", "is", null).is("shipped_at", null),
    getReservasCounts(),
  ])

  return {
    toPrepare: toPrepare.count ?? 0,
    toShip: toShip.count ?? 0,
    // Badge de l'onglet Reservas : seules les demandes "requested" exigent
    // une action de l'équipe (confirmer/annuler) — les "confirmed" sont déjà
    // traitées et n'ont pas besoin d'attirer l'œil.
    pendingBookings: reservas.requested,
  }
}
