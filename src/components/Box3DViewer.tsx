"use client"

import { useEffect, useRef, useState } from "react"
import { BOX3D_ENV, BOX3D_GLB_DESKTOP, BOX3D_GLB_MOBILE, BOX3D_MOBILE_QUERY } from "./box3dAssets"

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
        Record<string, unknown>
    }
  }
}

// Framing: the raw viewer fits the box to 71.5% of the square; scale(1.118) makes it
// 79.85%, centered — same size and position as the box in the "Por fuera" photo.
// Desktop gets a canvas 1.4x larger (so a wheel zoom-in is not clipped at the square's
// edges) and a proportionally smaller scale, giving the exact same framing at rest.
// Grade + drop shadow tuned to match the photo carousel (vivid colors, soft shadow
// falling down-right): a CSS drop-shadow, since model-viewer's floor shadow sits
// centered under the box.
const DESKTOP_OVERSIZE = 1.4

// Zoom limits in meters: model-viewer's percentage limits are not measured from the
// starting distance. AUTO_RADIUS is the "100%" distance of this model (start view).
const AUTO_RADIUS = 0.4209
const MAX_RADIUS = `${(AUTO_RADIUS * 1.1).toFixed(4)}m`
const MIN_RADIUS_TOUCH = `${(AUTO_RADIUS * 0.9).toFixed(4)}m`
const MIN_RADIUS_DESKTOP = `${(AUTO_RADIUS * 0.65).toFixed(4)}m`

function viewerStyle(desktop: boolean): React.CSSProperties {
  const k = desktop ? DESKTOP_OVERSIZE : 1
  return {
    "--poster-color": "transparent",
    transform: `scale(${1.118 / k})`,
    filter: `contrast(1.05) saturate(0.95) drop-shadow(${8 * k}px ${12 * k}px ${16 * k}px rgba(24,20,15,0.3))`,
  } as React.CSSProperties
}

// Box standing on its edge, sleeve forward. No auto-rotation: drag to turn.
// Full horizontal turn, tilt 45° above and 45° below the horizon,
// zoom 90–110% on touch screens (pinch), and on desktop down to 65% of the distance
// (wheel) to see the box up close. Pan and tap-to-recenter are off so the box always
// stays on its axis; touch drags scroll the page vertically. This component is only mounted when the user asks for
// 3D (and lazily, by the parent), so model-viewer and the GLB cost nothing for
// everyone else.
export default function Box3DViewer({ onLoaded }: { onLoaded?: () => void }) {
  const [ready, setReady] = useState(false)
  const [mobile, setMobile] = useState<boolean | null>(null)
  const viewerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMobile(window.matchMedia(BOX3D_MOBILE_QUERY).matches)
    import("@google/model-viewer").then(() => setReady(true))
  }, [])

  useEffect(() => {
    const el = viewerRef.current
    if (!el) return
    const onLoad = () => {
      onLoaded?.()
    }
    el.addEventListener("load", onLoad)
    if ((el as HTMLElement & { loaded?: boolean }).loaded) onLoad()   // already loaded (cached GLB) before we listened
    return () => {
      el.removeEventListener("load", onLoad)
    }
  }, [ready, mobile, onLoaded])

  // The parent keeps the "Por fuera" photo in the same square until this fires, so nothing collapses while the chunk and GLB load.
  if (!ready || mobile === null) return null
  return (
    <model-viewer
      src={mobile ? BOX3D_GLB_MOBILE : BOX3D_GLB_DESKTOP}
      alt="Caja Vivabox en 3D, gírala para verla desde todos los lados"
      camera-controls=""
      interaction-prompt="none"
      disable-pan=""
      disable-tap=""
      touch-action="pan-y"
      shadow-intensity="0"
      exposure="0.95"
      environment-image={BOX3D_ENV}
      environment-intensity="0.85"
      tone-mapping="neutral"
      camera-orbit="0deg 84deg 100%"
      min-camera-orbit={`-Infinity 45deg ${mobile ? MIN_RADIUS_TOUCH : MIN_RADIUS_DESKTOP}`}
      max-camera-orbit={`Infinity 135deg ${MAX_RADIUS}`}
      ref={viewerRef}
      style={viewerStyle(!mobile)}
      className={`absolute ${mobile ? "inset-0" : "-inset-[20%]"} h-auto w-auto`}
    >
      {/* empty slot replaces the built-in progress bar; the parent shows a spinner */}
      <div slot="progress-bar" />
    </model-viewer>
  )
}
