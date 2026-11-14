"use client"

import { useLayoutEffect, useRef } from "react"
import { Heart } from "lucide-react"
import { coveredByYourGrace } from "@/lib/fonts"

type Props = {
  mensaje: string
  firma: string
  corazon: boolean
  className?: string // extra classes on the card itself (e.g. a group-hover shadow)
}

// Thin cardstock edge (a lighter rim on the lit top-left side, a faint darker
// one on the bottom-right) plus a layered shadow falling bottom-right, so the
// card reads as a 2 mm piece of cardboard resting on the surface.
const CARD_RELIEF =
  "shadow-[inset_1px_1px_0_rgba(255,255,255,0.95),inset_-1px_-1px_0_rgba(24,20,15,0.07),0_0_0_0.5px_rgba(24,20,15,0.08),1px_2px_2px_rgba(24,20,15,0.12),4px_8px_14px_rgba(24,20,15,0.14),9px_16px_28px_rgba(24,20,15,0.12)] transition-shadow duration-300 motion-reduce:transition-none"

// Square card as printed in the box: the message and the signature share one
// handwriting size, picked as the largest that still fits the central area.
export default function MessageCardPreview({ mensaje, firma, corazon, className = "" }: Props) {
  const zoneRef = useRef<HTMLDivElement>(null)
  const empty = mensaje.trim().length === 0

  useLayoutEffect(() => {
    const zone = zoneRef.current
    if (!zone) return

    function fit() {
      if (!zone) return
      const width = zone.clientWidth
      const max = width * 0.138
      const min = width * 0.058
      let size = max
      zone.style.fontSize = `${size}px`
      while (size > min && zone.scrollHeight > zone.clientHeight + 1) {
        size -= 0.5
        zone.style.fontSize = `${size}px`
      }
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(zone)
    document.fonts?.ready.then(fit)
    return () => observer.disconnect()
  }, [mensaje, firma, corazon])

  return (
    <div className={`w-full max-w-[340px] mx-auto aspect-square bg-[#FCFBF6] ${CARD_RELIEF} p-[12%] flex flex-col ${className}`}>
      <div
        ref={zoneRef}
        className={`${coveredByYourGrace.className} flex-1 min-h-0 overflow-hidden flex flex-col justify-center text-[#0B3C5D] leading-[1.3] transition-opacity ${empty ? "opacity-45" : ""}`}
      >
        <p className="whitespace-pre-wrap break-words">
          {empty ? "Tu mensaje aparecerá aquí." : mensaje}
        </p>
        {(firma || corazon) && (
          <div className="mt-[0.5em] flex items-center justify-end gap-[0.3em] text-right">
            <span>{firma}</span>
            {corazon && <Heart className="size-[1em] shrink-0" strokeWidth={1.75} aria-hidden="true" />}
          </div>
        )}
      </div>
    </div>
  )
}
