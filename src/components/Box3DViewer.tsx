"use client"

import { useEffect, useRef, useState } from "react"

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> &
        Record<string, unknown>
    }
  }
}

const MOBILE_QUERY = "(max-width: 767px)"

// scale(1.118) makes the box 79.85% of the square, centered — same size and
// position as the box in the "Por fuera" photo (the raw viewer fits it to 71.5%).
// Grade + drop shadow tuned to match the photo carousel (vivid colors, soft
// shadow falling down-right). The shadow is a CSS drop-shadow rather than
// model-viewer's floor shadow, which sits centered under the box.
const VIEWER_STYLE = {
  width: "100%",
  height: "100%",
  "--poster-color": "transparent",
  transform: "scale(1.118)",
  filter: "contrast(1.05) saturate(0.95) drop-shadow(8px 12px 16px rgba(24,20,15,0.3))",
} as React.CSSProperties

// Box standing on its edge, sleeve forward. No auto-rotation: drag to turn.
// Full horizontal turn, tilt 45° above and 45° below the horizon,
// light pinch zoom (90–110%). Pan and tap-to-recenter are off so the box always
// stays on its axis; touch drags scroll the page vertically. This component is only mounted when the user asks for
// 3D (and lazily, by the parent), so model-viewer and the GLB cost nothing for
// everyone else.
export default function Box3DViewer({ onLoaded }: { onLoaded?: () => void }) {
  const [ready, setReady] = useState(false)
  const [src, setSrc] = useState<string | null>(null)
  const viewerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setSrc(window.matchMedia(MOBILE_QUERY).matches ? "/3d/vivabox_box_mobile.glb" : "/3d/vivabox_box.glb")
    import("@google/model-viewer").then(() => setReady(true))
  }, [])

  useEffect(() => {
    const el = viewerRef.current
    if (!el) return
    const onLoad = () => {
      onLoaded?.()
    }
    // The wheel scrolls the page instead of zooming, so the box never traps the scroll.
    const onWheel = (e: Event) => e.stopImmediatePropagation()
    el.addEventListener("load", onLoad)
    if ((el as HTMLElement & { loaded?: boolean }).loaded) onLoad()   // already loaded (cached GLB) before we listened
    el.addEventListener("wheel", onWheel, { capture: true })
    return () => {
      el.removeEventListener("load", onLoad)
      el.removeEventListener("wheel", onWheel, { capture: true })
    }
  }, [ready, src, onLoaded])

  // The parent keeps the "Por fuera" photo in the same square until this fires, so nothing collapses while the chunk and GLB load.
  if (!ready || !src) return null
  return (
    <model-viewer
      src={src}
      alt="Caja Vivabox en 3D, gírala para verla desde todos los lados"
      camera-controls=""
      interaction-prompt="none"
      disable-pan=""
      disable-tap=""
      touch-action="pan-y"
      shadow-intensity="0"
      exposure="0.95"
      environment-image="/3d/env_studio.hdr"
      environment-intensity="0.85"
      tone-mapping="neutral"
      camera-orbit="0deg 84deg 100%"
      min-camera-orbit="-Infinity 45deg 90%"
      max-camera-orbit="Infinity 135deg 110%"
      ref={viewerRef}
      style={VIEWER_STYLE}
      className="absolute inset-0"
    >
      {/* empty slot replaces the built-in progress bar; the parent shows a spinner */}
      <div slot="progress-bar" />
    </model-viewer>
  )
}
