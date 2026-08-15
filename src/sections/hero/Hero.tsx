"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import BrandRibbon from "@/components/ui/BrandRibbon"
import FitLine from "@/components/ui/FitLine"
import { writeSubtitleFontSize } from "@/utils/subtitleFontSize"
import { boxes } from "@/data/boxes"

const DESKTOP_SRC = "/videos/hero/hero.mp4"
const MOBILE_SRC = "/videos/hero/hero-mobile.mp4"
const DESKTOP_POSTER = "/images/hero/hero-poster.webp"
const MOBILE_POSTER = "/images/hero/hero-poster-mobile.webp"

const vivabox = boxes[0]

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  // Defaults to desktop for SSR/first paint; swapped in effect below once
  // we can read the viewport. `<source media="...">` looks like the right
  // tool for this but iOS WebKit resolves it inconsistently between Safari
  // and Chrome-for-iOS, so the source is picked in JS instead.
  const [src, setSrc] = useState(DESKTOP_SRC)
  const poster = src === MOBILE_SRC ? MOBILE_POSTER : DESKTOP_POSTER

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)")
    setSrc(mql.matches ? MOBILE_SRC : DESKTOP_SRC)
  }, [])

  // Subtitle must always read as a single line (never wrap), so its size is
  // fit live to the available width instead of using a fixed responsive
  // class. The result is broadcast via a CSS var so the bridge steps below
  // (a separate component/file) can match it. 16/18 are the previous fixed
  // sizes, kept as the ceiling this can shrink from.
  const [subtitleMax, setSubtitleMax] = useState(16)

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)")
    const update = () => setSubtitleMax(mql.matches ? 18 : 16)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

  const handleSubtitleFontSize = useCallback((size: number) => {
    writeSubtitleFontSize(size)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // iOS Safari checks the `muted` attribute at parse time, before React
    // hydration has a chance to set it as a JS property — without this,
    // autoplay can silently fail on iPhone. Retried on loadedmetadata since
    // play() can reject if called before the new source is ready.
    video.muted = true
    const tryPlay = () => video.play().catch(() => {})
    tryPlay()
    video.addEventListener("loadedmetadata", tryPlay)
    return () => video.removeEventListener("loadedmetadata", tryPlay)
  }, [src])

  return (
    <section className="relative h-[78vh] md:h-[82vh] min-h-[620px] overflow-hidden">

      {/* VIDEO */}

      <video
        key={src}
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label="Persona recibiendo una Vivabox como regalo"
        className="
          absolute inset-0
          w-full h-full
          object-cover
          object-center
        "
      />

      {/* SUBTLE READABILITY GRADIENT */}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,.40) 0%, rgba(0,0,0,.15) 30%, rgba(0,0,0,0) 55%)",
        }}
      />

      {/* TOP OVERLAY */}

      <div
        className="
          absolute
          inset-x-0
          top-0
          h-[130px]
          pointer-events-none
          bg-gradient-to-b
          from-ink/25
          via-ink/5
          to-transparent
        "
      />

      {/* CONTENT */}

      <div className="relative h-full max-w-[1200px] mx-auto px-7 md:px-10 flex flex-col pointer-events-none">

        {/* FLEXIBLE SPACE */}

        <div className="flex-1" />

        {/* HEADLINE */}

        <h1
          className="
            h1
            text-white
            [text-shadow:0_2px_16px_rgba(0,0,0,.35)]
          "
        >
          Tú regalas,
          <br />
          ellos eligen.
        </h1>

        {/* SUBTITLE — always a single line, sized to fit rather than wrapping */}

        <div
          className="
            relative z-10
            mt-2
            max-w-[480px]
            text-white/90
            [text-shadow:0_2px_16px_rgba(0,0,0,.35)]
          "
        >
          <FitLine min={12} max={subtitleMax} onFontSize={handleSubtitleFontSize}>
            Vivabox es una caja de regalo de experiencias.
          </FitLine>
        </div>

        {/* CTA */}

        <div className="relative z-10 mt-4 pb-6 md:pb-8 pointer-events-auto">

          <div className="flex items-center gap-3">

            {/* PRIMARY */}

            <a
              href={`/proximamente?next=/cajas/${vivabox.slug}`}
              className="vb-btn-primary flex-[1.25] md:flex-none h-[54px] md:px-10 text-[17px]"
            >
              Comprar Vivabox
            </a>

            {/* SECONDARY */}

            <a
              href="#incluye"
              className="
                flex-1 md:flex-none
                h-[54px]
                md:px-8
                rounded-[18px]
                border-2
                border-white/70
                bg-white/5
                text-white
                text-[16px]
                font-medium
                inline-flex
                items-center
                justify-center
                transition
                hover:bg-white/15
              "
            >
              Cómo funciona
            </a>

          </div>

        </div>

      </div>

      {/* BRAND RIBBON */}

      <div className="absolute inset-x-0 bottom-0">
        <BrandRibbon />
      </div>

    </section>
  )
}
