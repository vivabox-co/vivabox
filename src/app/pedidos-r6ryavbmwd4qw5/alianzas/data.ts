import { getSupabase } from "@/services/supabase"
import { Lead } from "./types"
import { HISTORY_LIMIT } from "../types"

const LEAD_FIELDS =
  "id, created_at, name, company, location, whatsapp, email, category, experience_name, experience_description, website_or_instagram"

// Pas de statut/cycle de vie sur partner_leads (V1 volontairement plate,
// voir supabase/schema.sql) — le suivi se fait par WhatsApp/email en dehors
// de l'outil, donc une seule liste triée par date récente, plafonnée comme
// les historiques de Pedidos/Reservas pour éviter une requête non bornée.
export async function getLeads(): Promise<Lead[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("partner_leads")
    .select(LEAD_FIELDS)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT)

  if (error) throw error
  return data as Lead[]
}

// Compte pour le badge de la carte d'accueil — total, pas de sous-état
// "à traiter" possible sans colonne status.
export async function getAlianzasCounts() {
  const supabase = getSupabase()

  const { count } = await supabase
    .from("partner_leads")
    .select("id", { count: "exact", head: true })

  return { total: count ?? 0 }
}
