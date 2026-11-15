"use client"

import { useState } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import MessageCardPreview from "@/app/checkout/components/MessageCardPreview"
import type { MaquetaConfig } from "./types"

const SleeveViewer = dynamic(() => import("./SleeveViewer"), { ssr: false })

/* TRUE-TO-SCALE. One unit = 1 cm:
     box 15 x 15 cm · phone 16 x 7.5 cm · message card 10 x 10 cm
   One arrangement on every screen, scaled to the container width: the box on
   the left, the phone overlapping its right edge, the card slid underneath
   between the two, on top of both.
   The Frente | Dorso switch always sits under the box, clear of the card. */

type Layout = {
  w: number // container size in cm
  h: number
  box: { cx: number; cy: number } // center of the 15 cm box
  phone: { x: number; y: number } // top-left
  card: { x: number; y: number } // top-left
  toggle: { x: number; y: number } // x = center, y = top
  maxWidth: number // px
}

const TRIANGLE: Layout = {
  w: 23,
  h: 23,
  box: { cx: 7.5, cy: 7.5 },
  phone: { x: 14.5, y: 0.5 }, // overlaps the box edge by ~1 cm
  card: { x: 9.5, y: 12.9 }, // corners just overlap the box and the phone; bottom edge = container edge
  toggle: { x: 2.9, y: 18.4 },
  maxWidth: 560,
}

// The 3D box fills ~80% of its square (same framing as the homepage), so the
// square is drawn larger than the 15 cm box it shows.
const BOX_INK = 0.8
const BOX_SQUARE_CM = 15 / BOX_INK

// eslint-disable-next-line @next/next/no-img-element
const LogoImg = ({ src, className }: { src: string; className: string }) => <img src={src} alt="" className={className} />

// Faithful to the real activation welcome screen (vivabox-appben, /activar):
// blurred photo, frosted card, navy button, the company logo where the
// Vivabox logo normally sits. Sized in cqw of the phone itself.
export function AppScreen({ logoUrl }: { logoUrl: string | null }) {
  return (
    <div className="@container w-full">
      <div className="rounded-[15cqw] bg-[#0f0d0a] p-[3cqw] shadow-[3cqw_6cqw_13cqw_rgba(0,0,0,0.5)] ring-1 ring-white/15">
        <div className="relative aspect-[7.5/16] overflow-hidden rounded-[12.5cqw]">
          <Image
            src="/images/empresas/app-welcome-bg.webp"
            alt=""
            fill
            sizes="200px"
            className="scale-[1.05] object-cover"
          />
          <div className="absolute inset-0 bg-white/25 backdrop-blur-[1px]" />

          <span className="absolute left-1/2 top-[5cqw] z-10 h-[6cqw] w-[26cqw] -translate-x-1/2 rounded-full bg-[#0f0d0a]" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-[6cqw] pb-[9%]">
            <div className="mb-[9cqw] flex min-h-[20cqw] items-center justify-center">
              {logoUrl ? (
                <LogoImg src={logoUrl} className="max-h-[20cqw] max-w-[43cqw] object-contain" />
              ) : (
                <LogoImg src="/images/empresas/app-logo-vivabox.svg" className="h-auto w-[27cqw]" />
              )}
            </div>

            <div className="w-full rounded-[10cqw] bg-white/75 px-[6cqw] pb-[10cqw] pt-[12cqw] text-center shadow-[0_6cqw_16cqw_rgba(0,0,0,0.12)] backdrop-blur-md">
              <p className="text-[5.5cqw] font-semibold leading-tight text-[#152F40]">Te hicieron un regalo.</p>
              <p className="mt-[3.3cqw] text-[7.3cqw] font-bold leading-[1.08] text-[#152F40]">
                Ahora <span className="text-[#FE842F]">eliges tú</span> la experiencia.
              </p>
              <p className="mx-auto mt-[4.7cqw] max-w-[88%] text-[4.3cqw] leading-snug text-[#152F40]/70">
                Descubre las experiencias disponibles para ti.
              </p>
              <span className="mt-[8.7cqw] flex h-[14.7cqw] items-center justify-center rounded-[4.7cqw] bg-[#152F40] text-[5.3cqw] font-semibold text-white">
                Empezar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfiguratorPreview({ config }: { config: MaquetaConfig }) {
  const [side, setSide] = useState<"front" | "back">("front")
  const [ready3D, setReady3D] = useState(false)
  const L = TRIANGLE
  const pctW = (cm: number) => `${(cm / L.w) * 100}%`
  const pctH = (cm: number) => `${(cm / L.h) * 100}%`

  return (
    <div
      className="relative mx-auto w-full"
      style={{ aspectRatio: `${L.w} / ${L.h}`, maxWidth: L.maxWidth }}
      role="group"
      aria-label="Vista previa de tu Vivabox personalizada, a escala real"
    >
      {/* BOX 3D, 15 x 15 cm — the photo holds the square until the model is ready */}
      <div
        className="absolute"
        style={{
          width: pctW(BOX_SQUARE_CM),
          left: pctW(L.box.cx - BOX_SQUARE_CM / 2),
          top: pctH(L.box.cy - BOX_SQUARE_CM / 2),
        }}
      >
        <div className="relative aspect-square">
          <Image
            src="/images/box-includes/vivabox-caja-regalo.webp"
            alt=""
            fill
            sizes="(min-width: 768px) 320px, 45vw"
            className={`object-contain transition-opacity duration-500 ${ready3D ? "opacity-0" : "opacity-100"}`}
          />
          <SleeveViewer config={config} side={side} onLoaded={() => setReady3D(true)} />
        </div>
      </div>

      {/* APP, 16 x 7.5 cm — overlaps the box on the right */}
      <div className="absolute z-10 rotate-[3deg]" style={{ left: pctW(L.phone.x), top: pctH(L.phone.y), width: pctW(7.5) }}>
        <AppScreen logoUrl={config.logoUrl} />
      </div>

      {/* CARD, 10 x 10 cm — same card as the checkout, on top of box and phone */}
      <div
        className="group absolute z-20 -rotate-[3deg] transition-transform duration-300 hover:-translate-y-[2%] motion-reduce:transition-none"
        style={{ left: pctW(L.card.x), top: pctH(L.card.y), width: pctW(10) }}
      >
        <MessageCardPreview
          mensaje={config.message}
          firma={config.signature}
          corazon={false}
          className="group-hover:shadow-[inset_1px_1px_0_rgba(255,255,255,0.95),inset_-1px_-1px_0_rgba(24,20,15,0.07),0_0_0_0.5px_rgba(24,20,15,0.08),2px_4px_4px_rgba(24,20,15,0.14),8px_14px_22px_rgba(24,20,15,0.18),16px_26px_44px_rgba(24,20,15,0.16)]"
        />
      </div>

      {/* FRENTE | DORSO — under the box, never covered */}
      <div
        role="group"
        aria-label="Cara de la caja"
        className="absolute z-30 flex -translate-x-1/2 rounded-full bg-white/10 p-0.5 ring-1 ring-white/20 sm:p-1"
        style={{ left: pctW(L.toggle.x), top: pctH(L.toggle.y) }}
      >
        {(["front", "back"] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={side === s}
            onClick={() => setSide(s)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition sm:px-4 sm:py-1.5 sm:text-[13px] ${
              side === s ? "bg-white text-ink" : "text-white/75 hover:text-white"
            }`}
          >
            {s === "front" ? "Frente" : "Dorso"}
          </button>
        ))}
      </div>
    </div>
  )
}
