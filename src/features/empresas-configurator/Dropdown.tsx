"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

export type DropdownOption = { value: string; label: string }

// Rounded dark dropdown. The browser's own list can't be rounded or themed, so
// on a mouse/keyboard device we draw our own; on touch screens we keep the
// native picker, which is far more natural with a finger.
export default function Dropdown({
  id,
  value,
  options,
  onChange,
  disabled = false,
  className = "",
  ariaLabel,
}: {
  id: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  disabled?: boolean
  className?: string // look of the closed field
  ariaLabel?: string
}) {
  const listId = useId()
  const [touch, setTouch] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value))
  const selected = options[selectedIndex]

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)")
    const update = () => setTouch(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // Close on a click or tap anywhere else.
  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [open])

  function openList() {
    setActive(selectedIndex)
    setOpen(true)
  }

  function choose(index: number) {
    onChange(options[index].value)
    setOpen(false)
    buttonRef.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        if (!open) openList()
        else setActive((a) => Math.min(options.length - 1, a + 1))
        break
      case "ArrowUp":
        e.preventDefault()
        if (!open) openList()
        else setActive((a) => Math.max(0, a - 1))
        break
      case "Home":
        if (open) {
          e.preventDefault()
          setActive(0)
        }
        break
      case "End":
        if (open) {
          e.preventDefault()
          setActive(options.length - 1)
        }
        break
      case "Enter":
      case " ":
        e.preventDefault()
        if (open) choose(active)
        else openList()
        break
      case "Escape":
        if (open) {
          e.preventDefault()
          setOpen(false)
        }
        break
      case "Tab":
        setOpen(false)
        break
    }
  }

  if (touch) {
    return (
      <select id={id} value={value} disabled={disabled} aria-label={ariaLabel} onChange={(e) => onChange(e.target.value)} className={className}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#26211b] text-white">
            {o.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`${className} flex items-center justify-between gap-2 text-left`}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/60 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-64 overflow-auto rounded-[14px] bg-[#2b251e] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/12"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-[14px] transition-colors ${
                  isSelected ? "bg-white/14 text-white" : active === i ? "bg-white/8 text-white" : "text-white/80"
                }`}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
