"use client"

import { useState } from "react"
import { ChevronDown, type LucideIcon } from "lucide-react"

export type FaqAccordionItem = {
  icon?: LucideIcon
  question: string
  answer: string
}

type Props = {
  items: FaqAccordionItem[]
}

// Editorial FAQ list — thin dividers instead of stacked cards, icons and
// chevrons kept small and secondary so the question/answer text carries the
// hierarchy. Border color rides --nm-border so it adapts automatically
// whether the section sits in a .vb-dark context or the light default.
export default function FaqAccordion({ items }: Props) {

  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      {items.map((item, i) => {

        const Icon = item.icon
        const isOpen = open === i
        const isLast = i === items.length - 1

        return (

          <div
            key={i}
            className={`border-[color:var(--nm-border)] ${isLast ? "" : "border-b"}`}
          >

            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center gap-3 py-3.5 md:py-4 text-left"
            >

              {Icon && (
                <Icon
                  size={15}
                  strokeWidth={1.5}
                  className="shrink-0 text-primary"
                />
              )}

              <span className="flex-1 text-[14.5px] md:text-[15px] font-medium leading-snug">
                {item.question}
              </span>

              <ChevronDown
                size={15}
                strokeWidth={1.75}
                className={`shrink-0 opacity-40 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-primary opacity-100" : ""
                }`}
              />

            </button>

            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0">
                <p
                  onClick={() => setOpen(null)}
                  className={`cursor-pointer pb-3.5 md:pb-4 text-[13.5px] leading-relaxed opacity-65 ${
                    Icon ? "pl-[27px]" : ""
                  }`}
                >
                  {item.answer}
                </p>
              </div>
            </div>

          </div>

        )

      })}
    </div>
  )
}
