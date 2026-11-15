"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import { X } from "lucide-react"
import MessageCardPreview from "@/app/checkout/components/MessageCardPreview"
import { AppScreen } from "./ConfiguratorPreview"
import type { MaquetaConfig } from "./types"

const SleeveViewer = dynamic(() => import("./SleeveViewer"), { ssr: false })

export type ZoomKind = "box" | "phone" | "card"
export type ZoomState = { kind: ZoomKind; rect: DOMRect }

const DURATION = 320
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const CLOSE_DRAG_PX = 90

// Width of the enlarged object, chosen so it always fits the screen in both directions.
const WIDTH: Record<ZoomKind, string> = {
  box: "min(100vw, 66vh)", // the 3D box fills ~80% of its square
  phone: "min(74vw, 36vh)", // the phone is 16 / 7.5 tall
  card: "min(92vw, 340px)",
}

// Phones only. The small preview stays as is; tapping an object opens it large,
// centered over the page. It grows from where it was and shrinks back to it.
export default function ZoomOverlay({
  zoom,
  config,
  side,
  onSide,
  onClose,
  onStart,
}: {
  zoom: ZoomState
  config: MaquetaConfig
  side: "front" | "back"
  onSide: (s: "front" | "back") => void
  onClose: () => void
  onStart?: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const drag = useRef<{ y: number } | null>(null)
  const tap = useRef<{ x: number; y: number; t: number } | null>(null)
  const [dy, setDy] = useState(0)
  const [ready3D, setReady3D] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // From (or back to) the place the object had in the small preview.
  const fromSource = useCallback((): Keyframe | null => {
    const panel = panelRef.current
    if (!panel) return null
    const to = panel.getBoundingClientRect()
    const from = zoom.rect
    if (!to.width || !from.width) return null
    const s = from.width / to.width
    const x = from.left + from.width / 2 - (to.left + to.width / 2)
    const y = from.top + from.height / 2 - (to.top + to.height / 2)
    return { transform: `translate(${x}px, ${y}px) scale(${s})` }
  }, [zoom.rect])

  useLayoutEffect(() => {
    if (!mounted) return
    const start = fromSource()
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const duration = reduce ? 0 : DURATION
    if (start) panelRef.current?.animate([start, { transform: "none" }], { duration, easing: EASE })
    backdropRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: "ease-out" })
  }, [mounted, fromSource])

  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    const end = fromSource()
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const duration = reduce ? 0 : DURATION - 60
    setDy(0)
    backdropRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: "ease-in", fill: "forwards" })
    const a = end
      ? panelRef.current?.animate([{ transform: "none" }, end], { duration, easing: "ease-in", fill: "forwards" })
      : undefined
    if (a) a.onfinish = onClose
    else onClose()
  }, [fromSource, onClose])

  // Page behind stays put while it is open; Escape closes.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [close])

  // Swipe down to close. Not from the 3D box itself: there a drag turns the box.
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("model-viewer, button")) return
    drag.current = { y: e.clientY }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    setDy(Math.max(0, e.clientY - drag.current.y))
  }
  const endDrag = () => {
    if (!drag.current) return
    drag.current = null
    if (dy > CLOSE_DRAG_PX) close()
    else setDy(0)
  }

  if (!mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada"
      className="fixed inset-0 z-[100] touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        ref={backdropRef}
        onClick={close}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        style={{ opacity: dy ? Math.max(0.3, 1 - dy / 400) : undefined }}
      />

      <button
        type="button"
        onClick={close}
        aria-label="Cerrar"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md active:bg-white/25"
      >
        <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
      </button>

      {/* Taps on the empty area fall through to the backdrop */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3"
        style={{ transform: dy ? `translateY(${dy}px)` : undefined, transition: drag.current ? "none" : "transform 200ms ease-out" }}
      >
        <div ref={panelRef} className="pointer-events-auto relative" style={{ width: WIDTH[zoom.kind] }}>
          {zoom.kind === "box" && (
            <div
              className="relative aspect-square"
              onPointerDown={(e) => {
                tap.current = { x: e.clientX, y: e.clientY, t: Date.now() }
              }}
              onPointerUp={(e) => {
                const s = tap.current
                tap.current = null
                if (!s || Math.hypot(e.clientX - s.x, e.clientY - s.y) > 6 || Date.now() - s.t > 350) return
                // A short tap on the empty corners of the square (outside the box) closes the view.
                const r = e.currentTarget.getBoundingClientRect()
                const dx = Math.abs(e.clientX - (r.left + r.width / 2)) / r.width
                const dy = Math.abs(e.clientY - (r.top + r.height / 2)) / r.height
                if (dx > 0.4 || dy > 0.45) close()
              }}
              onPointerCancel={() => (tap.current = null)}
            >
              <div className={`absolute inset-0 transition-opacity duration-200 ${ready3D ? "opacity-100" : "opacity-0"}`}>
                <SleeveViewer config={config} side={side} onLoaded={() => setReady3D(true)} />
              </div>
            </div>
          )}
          {zoom.kind === "phone" && <AppScreen logoUrl={config.logoUrl} onStart={onStart} />}
          {zoom.kind === "card" && (
            <MessageCardPreview mensaje={config.message} firma={config.signature} corazon={false} />
          )}
        </div>

        {zoom.kind === "box" && (
          <div
            role="group"
            aria-label="Cara de la caja"
            className="pointer-events-auto flex rounded-full bg-white/10 p-1 ring-1 ring-white/20"
          >
            {(["front", "back"] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={side === s}
                onClick={() => onSide(s)}
                className={`rounded-full px-5 py-2 text-[14px] font-medium transition ${
                  side === s ? "bg-white text-ink" : "text-white/75"
                }`}
              >
                {s === "front" ? "Frente" : "Dorso"}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
