"use client"

import { useState } from "react"
import { List, CalendarDays } from "lucide-react"
import { Booking } from "../types"
import { BookingCard } from "../components"
import { BookingsCalendar } from "./calendar"

// Toggle Lista/Calendario propre à Confirmadas — pas un nouvel onglet dans
// ReservasBottomNav, juste une vue alternative de la même liste de bookings.
export function ConfirmadasView({
  bookings,
  primaryAction,
  primaryLabel,
  cancelAction,
}: {
  bookings: Booking[]
  primaryAction?: (formData: FormData) => void
  primaryLabel?: string
  cancelAction?: (formData: FormData) => void
}) {
  const [view, setView] = useState<"list" | "calendar">("list")

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setView("list")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-[13px] px-3.5 py-2.5 text-sm font-semibold transition-colors ${
            view === "list" ? "bg-[#18140F] text-white" : "vb-card text-muted"
          }`}
        >
          <List size={16} /> Lista
        </button>
        <button
          type="button"
          onClick={() => setView("calendar")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-[13px] px-3.5 py-2.5 text-sm font-semibold transition-colors ${
            view === "calendar" ? "bg-[#18140F] text-white" : "vb-card text-muted"
          }`}
        >
          <CalendarDays size={16} /> Calendario
        </button>
      </div>

      {view === "list" ? (
        <div className="flex flex-col gap-4">
          {bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              primaryAction={primaryAction}
              primaryLabel={primaryLabel}
              cancelAction={cancelAction}
            />
          ))}
        </div>
      ) : (
        <BookingsCalendar
          bookings={bookings}
          primaryAction={primaryAction}
          primaryLabel={primaryLabel}
          cancelAction={cancelAction}
        />
      )}
    </div>
  )
}
