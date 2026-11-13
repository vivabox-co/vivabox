"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import MapPanel from "./MapPanel"
import type { MapExperience } from "./config"

// An iPhone window in portrait, built at real phone size (390 x 844 screen, what
// the beneficiary sees) and scaled down as a whole to fit the viewport, so the
// pins and vignette keep the app's proportions at any window size.
const SCREEN_W = 390
const SCREEN_H = 844
const BEZEL = 10
const W = SCREEN_W + BEZEL * 2
const H = SCREEN_H + BEZEL * 2
const MARGIN_X = 16
const MARGIN_Y = 28

const BUTTON = "#2c2c2e"

function fitScale() {
  return Math.min(1, (window.innerWidth - MARGIN_X * 2) / W, (window.innerHeight - MARGIN_Y * 2) / H)
}

export default function PortraitPhoneModal({
  experiences,
  onClose,
}: {
  experiences: MapExperience[]
  onClose: () => void
}) {
  const [scale, setScale] = useState<number | null>(null)

  useEffect(() => {
    const update = () => setScale(fitScale())
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  if (scale === null) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mapa de experiencias en Bogotá y Cundinamarca"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        background: "rgba(24,20,15,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        type="button"
        aria-label="Cerrar el mapa"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 14,
          right: 14,
          zIndex: 100001,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "none",
          background: "#fff",
          color: "#18140F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
        }}
      >
        <X size={22} aria-hidden="true" />
      </button>

      <div style={{ width: W * scale, height: H * scale }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            position: "relative",
            width: W,
            height: H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            boxSizing: "border-box",
            padding: BEZEL,
            background: "#0b0b0c",
            borderRadius: 62,
            boxShadow: "0 0 0 2px #3a3a3c, 0 36px 70px rgba(0,0,0,0.5)",
            ["--vb-legend-top" as string]: "58px",
          }}
        >
          {/* Side buttons: action + volume on the left, power on the right */}
          <span aria-hidden="true" style={{ position: "absolute", left: -4, top: 130, width: 4, height: 30, borderRadius: "3px 0 0 3px", background: BUTTON }} />
          <span aria-hidden="true" style={{ position: "absolute", left: -4, top: 190, width: 4, height: 56, borderRadius: "3px 0 0 3px", background: BUTTON }} />
          <span aria-hidden="true" style={{ position: "absolute", left: -4, top: 258, width: 4, height: 56, borderRadius: "3px 0 0 3px", background: BUTTON }} />
          <span aria-hidden="true" style={{ position: "absolute", right: -4, top: 220, width: 4, height: 88, borderRadius: "0 3px 3px 0", background: BUTTON }} />

          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 52, overflow: "hidden", background: "#f4f1ea" }}>
            <MapPanel experiences={experiences} immediate appUI="portrait" />
            {/* Dynamic Island */}
            <span
              aria-hidden="true"
              style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 126, height: 37, borderRadius: 999, background: "#000", zIndex: 1300, pointerEvents: "none" }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
