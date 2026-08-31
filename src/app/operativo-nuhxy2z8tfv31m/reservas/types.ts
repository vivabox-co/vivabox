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

// Une des jusqu'à 3 alternatives préparées par Vivabox quand aucune des
// préférences du bénéficiaire (P1/P2/P3) n'est disponible — distinctes de
// ces préférences, voir getAlternatives() dans ./components.tsx.
export type ProposedAlternative = {
  date: string
  moment: string
  hour: string | null
}

// Une ligne de booking_reschedules (voir vivabox-appben,
// app/api/booking/[bookingId]/reschedule/route.ts) : chaque "Solicitar
// cambio" fait par le bénéficiaire depuis /ayuda de l'autre côté du schéma
// partagé. La plus ancienne en premier — voir enrich() dans ./data.ts.
export type RescheduleHistoryEntry = {
  previous_date: string | null
  previous_time_label: string | null
  new_date: string
  new_time_label: string
  changed_at: string
}

export type Booking = {
  id: string
  created_at: string
  requested_date: string | null
  requested_dates: string[] | null
  message: string | null
  status: BookingStatus

  proposed_date: string | null
  proposed_moment: string | null
  proposed_hour: string | null
  proposed_alternatives: ProposedAlternative[] | null
  reschedule_history: RescheduleHistoryEntry[]

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
