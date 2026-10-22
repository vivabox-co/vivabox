"use client"

import { useLayoutEffect, useRef } from "react"
import { Heart } from "lucide-react"
import { homemadeApple } from "@/lib/fonts"

type Props = {
  mensaje: string
  firma: string
  corazon: boolean
}

// Square card as printed in the box: the message and the signature share one
// handwriting size, picked as the largest that still fits the central area.
export default function MessageCardPreview({ mensaje, firma, corazon }: Props) {
  const zoneRef = useRef<HTMLDivElement>(null)
  const empty = mensaje.trim().length === 0

  useLayoutEffect(() => {
    const zone = zoneRef.current
    if (!zone) return

    function fit() {
      if (!zone) return
      const width = zone.clientWidth
      const max = width * 0.11
      const min = width * 0.045
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
    <div className="w-full max-w-[340px] mx-auto aspect-square bg-[#FCFBF6] shadow-[0_10px_22px_rgba(24,20,15,0.16)] p-[12%] flex flex-col">
      <div
        ref={zoneRef}
        className={`${homemadeApple.className} flex-1 min-h-0 overflow-hidden flex flex-col justify-center text-[#1F2A44] leading-[1.5] transition-opacity ${empty ? "opacity-45" : ""}`}
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
