"use client"

import { useEffect, useRef, useState } from "react"
import MapPanel from "./MapPanel"
import type { MapExperience } from "./config"

// A landscape iPhone, built at its real CSS-pixel size (852 x 393 screen, the
// size the beneficiary sees) and scaled down as a whole to fit the column. That
// way the map, pins and vignette keep exactly the same proportions as in the
// app -- only the phone itself is smaller on the page.
const SCREEN_W = 852
const SCREEN_H = 393
const BEZEL = 10
const W = SCREEN_W + BEZEL * 2
const H = SCREEN_H + BEZEL * 2

const BUTTON = "#2c2c2e"

export default function LandscapePhone({ experiences }: { experiences: MapExperience[] }) {
  const slotRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.65)

  useEffect(() => {
    const el = slotRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / W))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={slotRef} style={{ width: "calc(100% - 24px)", height: H * scale }}>
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
          ["--vb-legend-top" as string]: "16px",
        }}
      >
        {/* Side buttons: volume on the bottom edge, power on the top edge */}
        <span aria-hidden="true" style={{ position: "absolute", bottom: -4, left: 130, width: 26, height: 4, borderRadius: "0 0 3px 3px", background: BUTTON }} />
        <span aria-hidden="true" style={{ position: "absolute", bottom: -4, left: 180, width: 52, height: 4, borderRadius: "0 0 3px 3px", background: BUTTON }} />
        <span aria-hidden="true" style={{ position: "absolute", bottom: -4, left: 244, width: 52, height: 4, borderRadius: "0 0 3px 3px", background: BUTTON }} />
        <span aria-hidden="true" style={{ position: "absolute", top: -4, left: 210, width: 82, height: 4, borderRadius: "3px 3px 0 0", background: BUTTON }} />

        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 52, overflow: "hidden", background: "#f4f1ea" }}>
          <MapPanel experiences={experiences} appUI="landscape" />
          {/* Dynamic Island, on the left edge in landscape */}
          <span
            aria-hidden="true"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 37, height: 126, borderRadius: 999, background: "#000", zIndex: 1300, pointerEvents: "none" }}
          />
        </div>
      </div>
    </div>
  )
}
