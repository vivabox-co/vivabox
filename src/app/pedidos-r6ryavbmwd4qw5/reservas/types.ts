// Types purs — voir la note équivalente dans ../types.ts (seul fichier
// importable depuis un Client Component de ce sous-dossier).

export type BookingStatus = "requested" | "alternative_proposed" | "confirmed" | "completed" | "cancelled"

// Clés alignées sur MOMENT_LABEL côté vivabox-appben (lib/utils/moment.ts) —
// mêmes valeurs stockées en base des deux côtés du schéma partagé.
export type Moment = "morning" | "afternoon" | "night"

export const MOMENT_LABEL: Record<Moment, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
  night: "Noche",
}

export type Booking = {
  id: string
  created_at: string
  requested_date: string | null
  message: string | null
  status: BookingStatus

  proposed_date: string | null
  proposed_moment: string | null
  proposed_hour: string | null

  experience_code: string
  experience_title: string | null
  experience_city: string | null

  beneficiary_name: string | null
  beneficiary_email: string | null
  activation_code: string | null

  box_slug: string | null
  buyer_name: string | null
  buyer_email: string | null
}

export { formatDate } from "../types"

export function formatRequestedDate(isoDate: string | null) {
  if (!isoDate) return null
  // Colonne `date` (sans heure) — parsée en UTC pour éviter qu'un fuseau
  // négatif ne fasse glisser l'affichage d'un jour en arrière.
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("es-CO", { dateStyle: "long", timeZone: "UTC" })
}
