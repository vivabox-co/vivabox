"use client"

import { useState } from "react"

export type FaqAccordionItem = {
  question: string
  answer: string
}

type Props = {
  items: FaqAccordionItem[]
}

// Editorial FAQ list — thin dividers instead of stacked cards, no icons, a
// typographic +/- toggle instead of a chevron. Border color rides
// --nm-border so it adapts automatically whether the section sits in a
// .vb-dark context or the light default.
export default function FaqAccordion({ items }: Props) {

  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      {items.map((item, i) => {

        const isOpen = open === i
        const isLast = i === items.length - 1

        return (

          <div
            key={i}
            className={`border-[color:var(--nm-border)] ${isLast ? "" : "border-b"}`}
          >

            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center gap-4 py-7 text-left"
            >

              <span className="flex-1 text-[15px] font-medium leading-snug">
                {item.question}
              </span>

              <span
                aria-hidden="true"
                className={`relative h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                  isOpen ? "text-primary" : "text-current opacity-60"
                }`}
              >
                <span className="absolute left-1/2 top-1/2 h-[1.5px] w-[18px] -translate-x-1/2 -translate-y-1/2 bg-current" />
                <span
                  className={`absolute left-1/2 top-1/2 h-[18px] w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-200 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
              </span>

            </button>

            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0">
                <p
                  onClick={() => setOpen(null)}
                  className="cursor-pointer pb-7 pr-8 text-[15px] leading-relaxed opacity-65"
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
