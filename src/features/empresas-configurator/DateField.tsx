"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"]

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function monthLabel(d: Date): string {
  const s = d.toLocaleDateString("es-CO", { month: "long", year: "numeric" })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Date field with a compact, round calendar. On desktop it opens as a small
// card right under the field; on phones as a centered floating window.
export default function DateField({
  id,
  value,
  onChange,
  className = "",
}: {
  id: string
  value: string // "YYYY-MM-DD" or ""
  onChange: (iso: string) => void
  className?: string // look of the closed field
}) {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState(false)
  const [month, setMonth] = useState(() => new Date())
  const [draft, setDraft] = useState<Date | null>(null) // picked but not yet confirmed
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selected = value ? fromIso(value) : null

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setPhone(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: Event) => {
      if (!phone && !rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, phone])

  function openPanel() {
    const base = selected ?? new Date()
    setMonth(new Date(base.getFullYear(), base.getMonth(), 1))
    setDraft(selected)
    setOpen(true)
  }

  function confirm() {
    if (!draft) return
    onChange(toIso(draft))
    setOpen(false)
    buttonRef.current?.focus()
  }

  // Leading blanks so the 1st lands under the right weekday (week starts Monday).
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const lead = first.getDay() === 0 ? 6 : first.getDay() - 1
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ]
  const canGoBack = month.getFullYear() > today.getFullYear() || month.getMonth() > today.getMonth()

  const panel = (
    <div
      id={panelId}
      role="dialog"
      aria-label="Elegir fecha de entrega"
      className="w-[min(92vw,310px)] rounded-[20px] bg-[#2b251e] p-3.5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/12"
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          disabled={!canGoBack}
          aria-label="Mes anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <span className="text-[14px] font-medium">{monthLabel(month)}</span>
        <button
          type="button"
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          aria-label="Mes siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] text-white/50">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />
          const past = d < today
          const isSelected = draft !== null && sameDay(d, draft)
          const isToday = sameDay(d, today)
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => setDraft(d)}
              aria-label={d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
              aria-pressed={isSelected}
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[13px] transition ${
                isSelected
                  ? "bg-primary font-semibold text-white"
                  : past
                    ? "cursor-not-allowed text-white/25"
                    : "text-white/90 hover:bg-white/12"
              } ${isToday && !isSelected ? "underline decoration-primary decoration-2 underline-offset-4" : ""}`}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={confirm}
        disabled={!draft}
        className="mt-3 h-11 w-full rounded-full bg-primary text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        Confirmar
      </button>

      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2.5 text-[12px]">
        <button
          type="button"
          onClick={() => {
            onChange("")
            setOpen(false)
          }}
          className="px-1 text-white/70 underline hover:text-white"
        >
          Sin fecha
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-1 text-white/70 hover:text-white">
          Cerrar
        </button>
      </div>
    </div>
  )

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={`${className} flex items-center justify-between gap-2 text-left`}
      >
        <span className={`truncate ${value ? "" : "text-white/60"}`}>
          {selected ? selected.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "Elegir fecha"}
        </span>
        <Calendar className="h-4 w-4 shrink-0 text-white/60" strokeWidth={1.75} aria-hidden="true" />
      </button>

      {open &&
        (phone ? (
          <div
            className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/45 p-4"
            onClick={() => setOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>{panel}</div>
          </div>
        ) : (
          <div className="absolute left-0 top-full z-40 mt-1.5">{panel}</div>
        ))}
    </div>
  )
}
