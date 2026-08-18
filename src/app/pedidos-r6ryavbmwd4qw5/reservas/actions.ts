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

  await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId)
    .eq("status", "requested")

  revalidatePath(PAGE_PATH, "layout")
}

export async function completeBooking(formData: FormData) {
  const bookingId = getBookingId(formData)
  if (!bookingId) return

  const supabase = getSupabase()

  await supabase
    .from("bookings")
    .update({ status: "completed" })
    .eq("id", bookingId)
    .eq("status", "confirmed")

  revalidatePath(PAGE_PATH, "layout")
}

export async function cancelBooking(formData: FormData) {
  const bookingId = getBookingId(formData)
  if (!bookingId) return

  const supabase = getSupabase()

  // Autorisé depuis "requested" ou "confirmed" seulement — une réservation
  // déjà "completed" ne se décommande plus. Libère aussi l'index unique
  // bookings_one_active_per_code : le bénéficiaire peut redemander une autre
  // expérience juste après.
  await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .in("status", ["requested", "confirmed"])

  revalidatePath(PAGE_PATH, "layout")
}
