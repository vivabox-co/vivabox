"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  onClose: () => void
  onSelect: (date: Date) => void
}

export default function DatePickerModal({ onClose, onSelect }: Props) {
  const today = new Date()

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days = []

    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }

    return days
  }

  function isPast(date: Date) {
    return date < new Date(today.setHours(0, 0, 0, 0))
  }

  const days = getDaysInMonth(currentMonth)

  function handleSelect(date: Date) {
    if (isPast(date)) return
    onSelect(date)
    onClose()
  }

  function formatMonth(date: Date) {
    return date.toLocaleDateString("es-CO", {
      month: "long",
      year: "numeric",
    })
  }

  function changeMonth(offset: number) {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + offset,
        1
      )
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/25 z-[3000] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] bg-[var(--color-card)] rounded-t-[28px] p-6 pb-8 shadow-[0_-10px_30px_var(--nm-dark)]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="vb-icon-btn w-9 h-9" aria-label="Mes anterior">
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>

          <div className="font-semibold text-base capitalize">
            {formatMonth(currentMonth)}
          </div>

          <button onClick={() => changeMonth(1)} className="vb-icon-btn w-9 h-9" aria-label="Mes siguiente">
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* WEEK DAYS */}
        <div className="grid grid-cols-7 mb-2">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} className="text-center text-xs text-muted">{d}</div>
          ))}
        </div>

        {/* DAYS */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day, i) => {
            if (!day) return <div key={i} />

            const disabled = isPast(day)

            return (
              <button
                key={i}
                onClick={() => handleSelect(day)}
                disabled={disabled}
                className={`h-10 rounded-[11px] text-sm font-medium transition active:scale-95 ${
                  disabled
                    ? "opacity-30 cursor-not-allowed bg-[var(--color-card)]"
                    : "bg-[var(--color-card)] shadow-[2px_2px_6px_var(--nm-dark),-2px_-2px_6px_var(--nm-light)]"
                }`}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>

        {/* FOOTER */}
        <button onClick={onClose} className="vb-btn-soft w-full mt-4 h-11">
          Cancelar
        </button>

      </div>
    </div>
  )
}
