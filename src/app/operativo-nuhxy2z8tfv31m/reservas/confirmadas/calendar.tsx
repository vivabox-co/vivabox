"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Booking, formatRequestedDate } from "../types"
import { BookingCard } from "../components"

const WEEKDAY_LABEL = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const MONTH_LABEL = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`
}

// Grille Lun→Dom (convention colombienne) plutôt que Dim→Sam — getDay()
// renvoie Dim=0, d'où le décalage +6 %7 pour repartir sur Lun=0.
function buildMonthCells(year: number, month: number): (number | null)[] {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstWeekday).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// Vue calendrier de /reservas/confirmadas : les bookings sont positionnés
// sur leur requested_date (toujours renseignée une fois "confirmed", voir
// confirmBooking() dans actions.ts). Cliquer un jour avec des reservas
// affiche leurs BookingCard complètes juste en dessous, avec les mêmes
// actions que la vue liste (pas de duplication de logique métier).
export function BookingsCalendar({
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
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const b of bookings) {
      if (!b.requested_date) continue
      const arr = map.get(b.requested_date) ?? []
      arr.push(b)
      map.set(b.requested_date, arr)
    }
    return map
  }, [bookings])

  const cells = useMemo(() => buildMonthCells(year, month), [year, month])
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate())

  function goToMonth(delta: number) {
    let newMonth = month + delta
    let newYear = year
    if (newMonth < 0) { newMonth = 11; newYear -= 1 }
    if (newMonth > 11) { newMonth = 0; newYear += 1 }
    setMonth(newMonth)
    setYear(newYear)
    setSelectedDate(null)
  }

  const selectedBookings = selectedDate ? byDate.get(selectedDate) ?? [] : []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          className="vb-btn-soft h-9 w-9 flex items-center justify-center"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-[15px] font-semibold text-foreground">
          {MONTH_LABEL[month]} {year}
        </p>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          className="vb-btn-soft h-9 w-9 flex items-center justify-center"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-muted mb-1.5">
        {WEEKDAY_LABEL.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const key = dateKey(year, month, day)
          const dayBookings = byDate.get(key) ?? []
          const isToday = key === todayKey
          const isSelected = key === selectedDate

          return (
            <button
              type="button"
              key={key}
              disabled={dayBookings.length === 0}
              onClick={() => setSelectedDate(isSelected ? null : key)}
              className={`aspect-square rounded-[13px] flex flex-col items-center justify-center gap-0.5 text-sm transition-colors ${
                isSelected
                  ? "bg-[#18140F] text-white font-bold"
                  : dayBookings.length > 0
                    ? "bg-black/5 text-[#18140F] font-semibold"
                    : "text-muted cursor-default"
              } ${isToday && !isSelected ? "ring-1 ring-[#18140F]/40" : ""}`}
            >
              {day}
              {dayBookings.length > 0 && (
                <span className={`text-[10px] leading-none ${isSelected ? "text-white/80" : "text-muted"}`}>
                  {dayBookings.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div className="mt-5 pt-4 border-t border-black/5">
          <p className="text-sm font-semibold text-foreground mb-3">
            {formatRequestedDate(selectedDate)} · {selectedBookings.length} reserva(s)
          </p>
          <div className="flex flex-col gap-4">
            {selectedBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                primaryAction={primaryAction}
                primaryLabel={primaryLabel}
                cancelAction={cancelAction}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
