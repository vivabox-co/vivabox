"use server"

import { getSupabase } from "@/services/supabase"
import { revalidatePath } from "next/cache"
import { PAGE_PATH } from "../types"

function getBookingId(formData: FormData) {
  const bookingId = formData.get("bookingId")
  return typeof bookingId === "string" && bookingId ? bookingId : null
}

export async function confirmBooking(formData: FormData) {
  const bookingId = getBookingId(formData)
  if (!bookingId) return

  // Présent quand l'opérateur confirme une préférence précise du
  // bénéficiaire (P1/P2/P3) depuis la section "Preferencias del
  // beneficiario" — la reserva garde le même Booking ID, seule
  // requested_date change pour refléter l'option retenue.
  const confirmedDate = formData.get("confirmedDate")

  const supabase = getSupabase()

  // Si une date alternative avait été proposée et que le bénéficiaire a
  // donné son accord par un autre canal (téléphone…), confirmer ici doit
  // promouvoir cette date proposée en date effective — sinon la réservation
  // se confirmerait sur l'ancienne requested_date, qu'on sait déjà refusée.
  const { data: current } = await supabase
    .from("bookings")
    .select("status, proposed_date")
    .eq("id", bookingId)
    .maybeSingle()

  if (!current || !["requested", "alternative_proposed"].includes(current.status)) return

  // Depuis "alternative_proposed", confirmedDate désigne l'alternative
  // choisie (bouton "Confirmar" par ligne, voir getAlternatives() côté
  // components.tsx) — proposed_date reste le repli si jamais absent.
  const update =
    current.status === "alternative_proposed"
      ? {
          status: "confirmed" as const,
          requested_date: typeof confirmedDate === "string" && confirmedDate ? confirmedDate : current.proposed_date,
          proposed_date: null,
          proposed_moment: null,
          proposed_hour: null,
          proposed_alternatives: null,
        }
      : {
          status: "confirmed" as const,
          ...(typeof confirmedDate === "string" && confirmedDate ? { requested_date: confirmedDate } : {}),
        }

  const { error } = await supabase.from("bookings").update(update).eq("id", bookingId).eq("status", current.status)
  if (error) console.error("CONFIRM BOOKING ERROR:", error)

  revalidatePath(PAGE_PATH, "layout")
}

// Intervalles de 15 min uniquement — même contrainte que le <select> côté
// components.tsx, revalidée ici pour ne jamais faire confiance au FormData
// brut d'un client (devtools, requête manuelle...).
const QUARTER_HOUR = /^([01]\d|2[0-3]):(00|15|30|45)$/

function readAlternative(formData: FormData, index: number) {
  const date = formData.get(`altDate${index}`)
  const moment = formData.get(`altMoment${index}`)
  const hour = formData.get(`altHour${index}`)

  if (typeof date !== "string" || !date || typeof moment !== "string" || !moment) return null
  if (typeof hour === "string" && hour && !QUARTER_HOUR.test(hour)) return null

  return { date, moment, hour: typeof hour === "string" && hour ? hour : null }
}

// Saisie par l'équipe après avoir appelé le prestataire et constaté que la
// date demandée ne convient pas : bascule la réservation en
// "alternative_proposed" avec jusqu'à 3 alternatives (A1 → A2 → A3, ordre de
// présentation au bénéficiaire) pour qu'il en choisisse une, ou choisisse une
// autre expérience, depuis /reservar/seguimiento. Autorisé aussi depuis
// "alternative_proposed" pour corriger des alternatives déjà proposées avant
// que le bénéficiaire n'ait répondu.
export async function proposeAlternative(formData: FormData) {
  const bookingId = getBookingId(formData)
  if (!bookingId) return

  const alternatives = [1, 2, 3]
    .map((i) => readAlternative(formData, i))
    .filter((a): a is NonNullable<typeof a> => a !== null)

  if (alternatives.length === 0) return

  const seen = new Set<string>()
  for (const alt of alternatives) {
    const key = `${alt.date}|${alt.hour ?? ""}`
    if (seen.has(key)) return
    seen.add(key)
  }

  // proposed_date/moment/hour reflètent toujours la 1re alternative : c'est
  // ce que lit encore vivabox-appben aujourd'hui (respond-alternative), qui
  // ne connaît qu'une seule proposition à la fois.
  const [first] = alternatives
  const supabase = getSupabase()

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "alternative_proposed",
      proposed_date: first.date,
      proposed_moment: first.moment,
      proposed_hour: first.hour,
      proposed_alternatives: alternatives,
    })
    .eq("id", bookingId)
    .in("status", ["requested", "alternative_proposed"])
  if (error) console.error("PROPOSE ALTERNATIVE ERROR:", error)

  revalidatePath(PAGE_PATH, "layout")
}

export async function completeBooking(formData: FormData) {
  const bookingId = getBookingId(formData)
  if (!bookingId) return

  const supabase = getSupabase()

  const { error } = await supabase
    .from("bookings")
    .update({ status: "completed" })
    .eq("id", bookingId)
    .eq("status", "confirmed")
  if (error) console.error("COMPLETE BOOKING ERROR:", error)

  revalidatePath(PAGE_PATH, "layout")
}

export async function cancelBooking(formData: FormData) {
  const bookingId = getBookingId(formData)
  if (!bookingId) return

  const supabase = getSupabase()

  // Autorisé depuis "requested", "alternative_proposed" ou "confirmed"
  // seulement — une réservation déjà "completed" ne se décommande plus.
  // Libère aussi l'index unique bookings_one_active_per_code : le
  // bénéficiaire peut redemander une autre expérience juste après.
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled", proposed_date: null, proposed_moment: null, proposed_hour: null })
    .eq("id", bookingId)
    .in("status", ["requested", "alternative_proposed", "confirmed"])
  if (error) console.error("CANCEL BOOKING ERROR:", error)

  revalidatePath(PAGE_PATH, "layout")
}
