"use client"

import { useEffect, useRef, useState } from "react"
import { BOX3D_ENV, BOX3D_GLB_DESKTOP, BOX3D_GLB_MOBILE, BOX3D_MOBILE_QUERY } from "@/components/box3dAssets"
import { playfairDisplay } from "@/lib/fonts"
import { composeSleeveTexture } from "./sleeveTexture"
import { logoScale, resolveFrontLine } from "./frontText"
import type { MaquetaConfig } from "./types"

// Same viewer settings and framing as the homepage 3D box (Box3DViewer),
// plus a runtime texture swap on the sleeve material to show the company logo.
const DESKTOP_OVERSIZE = 1.4
const AUTO_RADIUS = 0.4209
const MAX_RADIUS = `${(AUTO_RADIUS * 1.1).toFixed(4)}m`
const MIN_RADIUS_TOUCH = `${(AUTO_RADIUS * 0.9).toFixed(4)}m`
const MIN_RADIUS_DESKTOP = `${(AUTO_RADIUS * 0.65).toFixed(4)}m`

// Slightly off-axis (camera ~28° to the right) so the box faces the left of
// the screen and shows a bit of its right side: it reads as a 3D object that
// can be turned, not a flat picture.
const TILT = 28
const ORBIT_FRONT = `${TILT}deg 84deg 100%`
const ORBIT_BACK = `${180 + TILT}deg 84deg 100%`

type ModelViewerEl = HTMLElement & {
  loaded?: boolean
  cameraOrbit: string
  createTexture: (uri: string) => Promise<unknown>
  model?: {
    materials: {
      name: string
      pbrMetallicRoughness: { baseColorTexture: { setTexture: (t: unknown) => void } }
    }[]
  }
}

function viewerStyle(desktop: boolean): React.CSSProperties {
  const k = desktop ? DESKTOP_OVERSIZE : 1
  return {
    "--poster-color": "transparent",
    transform: `scale(${1.118 / k})`,
    filter: `contrast(1.05) saturate(0.95) drop-shadow(${8 * k}px ${12 * k}px ${16 * k}px rgba(24,20,15,0.3))`,
  } as React.CSSProperties
}

export default function SleeveViewer({
  config,
  side,
  onLoaded,
}: {
  config: MaquetaConfig
  side: "front" | "back"
  onLoaded?: () => void
}) {
  const { logoUrl, color } = config
  const frontLine = resolveFrontLine(config.frontTextId, config.frontCustom)
  const scale = logoScale(config.logoSize)
  const [ready, setReady] = useState(false)
  const [mobile, setMobile] = useState<boolean | null>(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const viewerRef = useRef<ModelViewerEl | null>(null)
  const appliedRef = useRef(false)
  const lastBlobRef = useRef<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- media query is client-only; SSR must render the null state first
    setMobile(window.matchMedia(BOX3D_MOBILE_QUERY).matches)
    import("@google/model-viewer").then(() => setReady(true))
  }, [])

  useEffect(() => {
    const el = viewerRef.current
    if (!el) return
    const onLoad = () => {
      setModelLoaded(true)
      onLoaded?.()
    }
    el.addEventListener("load", onLoad)
    if (el.loaded) onLoad()
    return () => el.removeEventListener("load", onLoad)
  }, [ready, mobile, onLoaded])

  // Paint the logo on the sleeve whenever it changes.
  useEffect(() => {
    const el = viewerRef.current
    if (!el || !modelLoaded) return
    if (!logoUrl && !appliedRef.current) return
    let cancelled = false

    ;(async () => {
      try {
        const serifFamily = playfairDisplay.style.fontFamily
        await document.fonts.load(`400 40px ${serifFamily}`).catch(() => [])
        const textureUrl = await composeSleeveTexture({
          logoUrl,
          frontLine,
          logoScale: scale,
          color,
          serifFamily,
        })
        if (cancelled) return
        const material = el.model?.materials.find((m) => /^sleeve/i.test(m.name) && !/tranche/i.test(m.name))
        if (!material) return
        const texture = await el.createTexture(textureUrl)
        if (cancelled) return
        material.pbrMetallicRoughness.baseColorTexture.setTexture(texture)
        appliedRef.current = true
        if (lastBlobRef.current?.startsWith("blob:")) URL.revokeObjectURL(lastBlobRef.current)
        lastBlobRef.current = textureUrl
      } catch (err) {
        console.error("SLEEVE TEXTURE ERROR:", err)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [logoUrl, frontLine, scale, color, modelLoaded])

  // Turn the box to the requested face.
  useEffect(() => {
    const el = viewerRef.current
    if (!el || !modelLoaded) return
    el.cameraOrbit = side === "back" ? ORBIT_BACK : ORBIT_FRONT
  }, [side, modelLoaded])

  if (!ready || mobile === null) return null
  return (
    <>
    {/* Renders the serif once so the browser has it ready for the sleeve texture. */}
    <span aria-hidden className={`${playfairDisplay.className} pointer-events-none absolute opacity-0`}>.</span>
    <model-viewer
      ref={viewerRef as React.Ref<HTMLElement>}
      src={mobile ? BOX3D_GLB_MOBILE : BOX3D_GLB_DESKTOP}
      alt="Caja Vivabox en 3D con el logo de tu empresa, gírala para verla desde todos los lados"
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
      camera-orbit={ORBIT_FRONT}
      min-camera-orbit={`-Infinity 45deg ${mobile ? MIN_RADIUS_TOUCH : MIN_RADIUS_DESKTOP}`}
      max-camera-orbit={`Infinity 135deg ${MAX_RADIUS}`}
      style={viewerStyle(!mobile)}
      className={`absolute ${mobile ? "inset-0" : "-inset-[20%]"} h-auto w-auto`}
    >
      <div slot="progress-bar" />
    </model-viewer>
    </>
  )
}
