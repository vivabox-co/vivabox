"use client"

import Image from "next/image"
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

// Grade + drop shadow tuned to match the photo carousel (vivid colors, soft
// shadow falling down-right). The shadow is a CSS drop-shadow rather than
// model-viewer's floor shadow, which sits centered under the box.
const VIEWER_STYLE = {
  width: "100%",
  height: "100%",
  "--poster-color": "transparent",
  transform: "scale(1.18)",
  filter: "contrast(1.05) saturate(0.95) drop-shadow(8px 12px 16px rgba(24,20,15,0.3))",
} as React.CSSProperties

// Box standing on its edge, sleeve forward. No auto-rotation: drag to turn.
// Full horizontal turn, tilt up to 45° above the horizon (never from below),
// light zoom (90–110%). This component is only mounted when the user asks for
// 3D (and lazily, by the parent), so model-viewer and the GLB cost nothing for
// everyone else.
export default function Box3DViewer({ posterSrc, sizes }: { posterSrc: string; sizes: string }) {
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [src, setSrc] = useState<string | null>(null)
  const viewerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setSrc(window.matchMedia(MOBILE_QUERY).matches ? "/3d/vivabox_box_mobile.glb" : "/3d/vivabox_box.glb")
    import("@google/model-viewer").then(() => setReady(true))
  }, [])

  useEffect(() => {
    const el = viewerRef.current
    if (!el) return
    const onLoad = () => setLoaded(true)
    el.addEventListener("load", onLoad)
    return () => el.removeEventListener("load", onLoad)
  }, [ready, src])

  return (
    <div className="relative w-full aspect-square mb-[7%]">
      <Image
        src={posterSrc}
        alt=""
        fill
        sizes={sizes}
        draggable={false}
        className={`object-contain select-none transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`}
      />
      {ready && src && (
        <model-viewer
          src={src}
          alt="Caja Vivabox en 3D, gírala para verla desde todos los lados"
          camera-controls=""
          interaction-prompt="none"
          shadow-intensity="0"
          exposure="0.95"
          environment-image="/3d/env_studio.hdr"
          environment-intensity="0.85"
          tone-mapping="neutral"
          camera-orbit="0deg 84deg 100%"
          min-camera-orbit="-Infinity 45deg 90%"
          max-camera-orbit="Infinity 90deg 110%"
          ref={viewerRef}
          style={VIEWER_STYLE}
          className="absolute inset-0"
        />
      )}
    </div>
  )
}
