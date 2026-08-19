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

  const update =
    current.status === "alternative_proposed"
      ? { status: "confirmed" as const, requested_date: current.proposed_date, proposed_date: null, proposed_moment: null, proposed_hour: null }
      : { status: "confirmed" as const }

  const { error } = await supabase.from("bookings").update(update).eq("id", bookingId).eq("status", current.status)
  if (error) console.error("CONFIRM BOOKING ERROR:", error)

  revalidatePath(PAGE_PATH, "layout")
}

// Saisie par l'équipe après avoir appelé le prestataire et constaté que la
// date demandée ne convient pas : bascule la réservation en
// "alternative_proposed" pour que le bénéficiaire puisse l'accepter ou
// choisir une autre expérience depuis /reservar/seguimiento. Autorisé aussi
// depuis "alternative_proposed" pour permettre de corriger une date déjà
// proposée avant que le bénéficiaire n'ait répondu.
export async function proposeAlternative(formData: FormData) {
  const bookingId = getBookingId(formData)
  if (!bookingId) return

  const date = formData.get("proposedDate")
  const moment = formData.get("proposedMoment")
  const hour = formData.get("proposedHour")

  if (typeof date !== "string" || !date || typeof moment !== "string" || !moment) return

  const supabase = getSupabase()

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "alternative_proposed",
      proposed_date: date,
      proposed_moment: moment,
      proposed_hour: typeof hour === "string" && hour ? hour : null,
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
