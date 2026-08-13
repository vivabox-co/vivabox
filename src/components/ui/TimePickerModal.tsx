"use client"

import { useState } from "react"

type Props = {
  onClose: () => void
  onConfirm: (times: string[]) => void
}

export default function TimePickerModal({ onClose, onConfirm }: Props) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 9) // 9 → 20

  const [selected, setSelected] = useState<number[]>([])

  function toggleHour(h: number) {
    if (selected.includes(h)) {
      setSelected(selected.filter(x => x !== h))
      return
    }

    if (selected.length >= 2) return

    setSelected([...selected, h].sort((a, b) => a - b))
  }

  function handleConfirm() {
    if (selected.length === 0) return

    const formatted = selected.map(h => `${h}:00`)
    onConfirm(formatted)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/25 z-[3000] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] bg-[var(--color-card)] rounded-t-[28px] p-6 pb-8 text-center shadow-[0_-10px_30px_var(--nm-dark)]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* TITLE */}
        <h3 className="text-lg font-semibold mb-4">Elige la hora</h3>

        {/* GRID */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {hours.map((h) => {
            const isSelected = selected.includes(h)

            return (
              <button
                key={h}
                onClick={() => toggleHour(h)}
                className={`py-3 rounded-xl text-sm font-medium transition active:scale-95 ${
                  isSelected
                    ? "bg-[var(--color-accent-tint)] text-primary shadow-[inset_3px_3px_7px_var(--nm-dark-strong),inset_-3px_-3px_7px_var(--nm-light)]"
                    : "bg-[var(--color-card)] text-ink shadow-[3px_3px_8px_var(--nm-dark),-3px_-3px_8px_var(--nm-light)]"
                }`}
              >
                {h}:00
              </button>
            )
          })}
        </div>

        {/* INFO */}
        <p className="text-xs text-muted mb-4">
          Puedes elegir hasta 2 horarios
        </p>

        {/* CTA */}
        <button
          onClick={handleConfirm}
          disabled={selected.length === 0}
          className="vb-btn-primary w-full h-[52px] text-[15px] mb-2.5"
        >
          Confirmar horario
        </button>

        {/* CANCEL */}
        <button onClick={onClose} className="text-[13px] text-muted">
          Cancelar
        </button>

      </div>
    </div>
  )
}
