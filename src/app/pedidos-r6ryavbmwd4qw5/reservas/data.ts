import { getSupabase } from "@/services/supabase"
import { getSheetData } from "@/services/sheet"
import { Booking, BookingStatus } from "./types"
import { HISTORY_LIMIT } from "../types"

// bookings -> activation_codes (to-one, FK sur bookings.activation_code_id)
// -> ventas (to-one, FK sur activation_codes.venta_id). PostgREST renvoie ces
// deux embeds comme des objets (pas des tableaux) car la FK part bien de la
// table "many" vers la table "one" à chaque étape.
const BOOKING_FIELDS =
  "id, created_at, requested_date, message, status, experience_code, proposed_date, proposed_moment, proposed_hour, " +
  "activation_codes(code, beneficiary_name, beneficiary_email, ventas(box_slug, buyer_name, buyer_email))"

type RawBooking = {
  id: string
  created_at: string
  requested_date: string | null
  message: string | null
  status: BookingStatus
  proposed_date: string | null
  proposed_moment: string | null
  proposed_hour: string | null
  experience_code: string
  activation_codes: {
    code: string | null
    beneficiary_name: string | null
    beneficiary_email: string | null
    ventas: { box_slug: string | null; buyer_name: string | null; buyer_email: string | null } | null
  } | null
}

// Catalogue Experiencias hébergé sur Google Sheets — pas de FK possible avec
// experience_code, donc on résout le titre/ville nous-mêmes après coup.
async function experienceLookup(): Promise<Map<string, { title: string; city: string }>> {
  const rows = await getSheetData()
  return new Map(rows.map((r) => [r.codigo_interno, { title: r.title, city: r.city }]))
}

async function enrich(rows: RawBooking[]): Promise<Booking[]> {
  if (!rows.length) return []

  const experiences = await experienceLookup()

  return rows.map((r) => {
    const experience = experiences.get(r.experience_code)
    return {
      id: r.id,
      created_at: r.created_at,
      requested_date: r.requested_date,
      message: r.message,
      status: r.status,
      proposed_date: r.proposed_date,
      proposed_moment: r.proposed_moment,
      proposed_hour: r.proposed_hour,
      experience_code: r.experience_code,
      experience_title: experience?.title ?? null,
      experience_city: experience?.city ?? null,
      beneficiary_name: r.activation_codes?.beneficiary_name ?? null,
      beneficiary_email: r.activation_codes?.beneficiary_email ?? null,
      activation_code: r.activation_codes?.code ?? null,
      box_slug: r.activation_codes?.ventas?.box_slug ?? null,
      buyer_name: r.activation_codes?.ventas?.buyer_name ?? null,
      buyer_email: r.activation_codes?.ventas?.buyer_email ?? null,
    }
  })
}

// Regroupe "requested" et "alternative_proposed" : tant que le bénéficiaire
// n'a pas répondu (ou que l'équipe n'a pas confirmé/annulé à sa place),
// la réservation reste une affaire en cours pour Reservas — la séparer dans
// un onglet à part aurait cassé la nav à 3 tabs pour un état transitoire.
export async function getRequested(): Promise<Booking[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_FIELDS)
    .in("status", ["requested", "alternative_proposed"])
    .order("created_at", { ascending: true })

  if (error) throw error
  return enrich(data as unknown as RawBooking[])
}

export async function getConfirmed(): Promise<Booking[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_FIELDS)
    .eq("status", "confirmed")
    .order("created_at", { ascending: true })

  if (error) throw error
  return enrich(data as unknown as RawBooking[])
}

export async function getBookingHistory(): Promise<Booking[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_FIELDS)
    .in("status", ["completed", "cancelled"])
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT)

  if (error) throw error
  return enrich(data as unknown as RawBooking[])
}

// Comptes légers pour les badges (bottom nav + sub-nav de /reservas).
export async function getReservasCounts() {
  const supabase = getSupabase()

  const [requested, confirmed] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }).in("status", ["requested", "alternative_proposed"]),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
  ])

  return {
    requested: requested.count ?? 0,
    confirmed: confirmed.count ?? 0,
  }
}
