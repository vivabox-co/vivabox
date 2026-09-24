"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import BrandRibbon from "@/components/ui/BrandRibbon"
import BenefitsBar from "@/components/BenefitsBar"
import BoxFacesCarousel from "@/components/BoxFacesCarousel"
import FitLine from "@/components/ui/FitLine"
import { readSubtitleFontSize, SUBTITLE_FONT_SIZE_EVENT } from "@/utils/subtitleFontSize"
import { boxes } from "@/data/boxes"

const vivabox = boxes[0]

// Two fixed lines (chosen break point, never re-wrapped by the browser) —
// scaled up together as large as possible while neither line overflows the
// container. Like FitLine above, but fitting the widest of two nowrap lines
// instead of a single one, so the break point stays exactly where intended
// instead of wherever the browser's greedy wrap happens to land.

const BRIDGE_STEPS = [
  { number: "01", lines: ["Tú regalas", "Vivabox"] },
  { number: "02", lines: ["Ellos eligen", "la experiencia"] },
  { number: "03", lines: ["Nosotros", "reservamos"] },
] as const

// The 3-step bridge. Every column fits into an equal-width share of the row,
// but the label font size is computed ONCE for all three (the size the
// tightest column needs) rather than per column -- otherwise a step with
// longer copy (e.g. "la experiencia") shrinks more than a step with short
// copy (e.g. "Vivabox"), and the three labels end up visibly different
// sizes even though they're meant to read as one balanced set.
//
// The target size is read from --vb-subtitle-font-size (written by the hero
// subtitle's own fit-to-one-line logic in Hero.tsx) so the labels track the
// subtitle's actual size -- shrinking further only when a column is too
// narrow to fit at that size, since the number stays to the LEFT of a fixed
// two-line label (never a 3rd line, never above the number).
function BridgeSteps() {
  const rowRef = useRef<HTMLDivElement>(null)
  const outerRefs = useRef<(HTMLDivElement | null)[]>([])
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([])
  const line1Refs = useRef<(HTMLSpanElement | null)[]>([])
  const line2Refs = useRef<(HTMLSpanElement | null)[]>([])
  const [fontSize, setFontSize] = useState(16)

  useEffect(() => {
    const fit = () => {
      const target = readSubtitleFontSize(16)
      let size = target

      // No lower floor here on purpose: the label must never be wider than
      // its column, even on very narrow phones, so every column's true
      // required size is allowed to win outright instead of being propped
      // up to an arbitrary minimum (that's what previously pushed text past
      // its column and into the next step on small screens).
      //
      // containerWidth is derived analytically (column width minus the
      // number's own width minus the gap) rather than read off the text
      // div's rendered size -- the text div is centered, not flex-grown, so
      // whenever a column has room to spare its own box just reflects
      // whatever it last rendered at (a circular measurement) instead of the
      // true space available.
      for (let i = 0; i < BRIDGE_STEPS.length; i++) {
        const outer = outerRefs.current[i]
        const numberEl = numberRefs.current[i]
        const line1 = line1Refs.current[i]
        const line2 = line2Refs.current[i]
        if (!outer || !numberEl || !line1 || !line2) continue

        const gapPx = parseFloat(getComputedStyle(outer).columnGap) || 0
        const containerWidth = outer.clientWidth - numberEl.getBoundingClientRect().width - gapPx
        if (containerWidth <= 0) continue

        line1.style.fontSize = `${target}px`
        line2.style.fontSize = `${target}px`
        const naturalWidth = Math.max(line1.scrollWidth, line2.scrollWidth)
        if (naturalWidth === 0) continue

        size = Math.min(size, target * (containerWidth / naturalWidth))
      }

      // Measuring above leaves every line's inline style at `target`px as a
      // side effect. Reset it to the actual result now instead of trusting
      // the React re-render to do it -- when two calls in a row land on the
      // same computed size (very likely once things settle), React bails
      // out of re-rendering since the state didn't change, which would
      // otherwise leave the DOM stuck showing the mid-measurement `target`
      // value instead of the real one.
      for (let i = 0; i < BRIDGE_STEPS.length; i++) {
        const line1 = line1Refs.current[i]
        const line2 = line2Refs.current[i]
        if (!line1 || !line2) continue
        line1.style.fontSize = `${size}px`
        line2.style.fontSize = `${size}px`
      }

      setFontSize(size)
    }

    fit()
    // A column can still report its pre-stylesheet (unconstrained) width on
    // this very first synchronous call, which reads as "plenty of room" and
    // skips the shrink entirely -- with nothing dimensional left to change
    // once the real flex layout kicks in, the ResizeObserver below never
    // fires to correct it. One more measurement next frame, after layout has
    // definitely settled, catches that.
    const raf = requestAnimationFrame(fit)
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    if (rowRef.current) ro.observe(rowRef.current)
    // The subtitle broadcasts its size the moment it (re)computes, since the
    // hero can settle on its final value slightly after this component's own
    // mount (e.g. its responsive breakpoint effect firing a tick later) --
    // without this, that later correction would go unnoticed until the next
    // resize.
    window.addEventListener(SUBTITLE_FONT_SIZE_EVENT, fit)
    window.addEventListener("resize", fit)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener(SUBTITLE_FONT_SIZE_EVENT, fit)
      window.removeEventListener("resize", fit)
    }
  }, [])

  return (
    <div ref={rowRef} className="flex items-center gap-1 sm:gap-6 md:gap-8">
      {BRIDGE_STEPS.map((step, i) => (
        <div
          ref={(el) => { outerRefs.current[i] = el }}
          key={step.number}
          className={`min-w-0 flex items-center justify-center gap-1 md:gap-3 ${i === 0 ? "flex-1" : i === 1 ? "flex-[0.93] sm:flex-1" : "flex-[1.07] sm:flex-1"}`}
        >
          <span
            ref={(el) => { numberRefs.current[i] = el }}
            className="text-primary font-condensed font-semibold text-[32px] md:text-[49px] leading-none shrink-0"
          >
            {step.number}
          </span>
          <div className="min-w-0">
            <span
              ref={(el) => { line1Refs.current[i] = el }}
              className="block whitespace-nowrap text-white/90 leading-none text-left"
              style={{ fontSize }}
            >
              {step.lines[0]}
            </span>
            <span
              ref={(el) => { line2Refs.current[i] = el }}
              className="block whitespace-nowrap text-white/90 leading-none text-left"
              style={{ fontSize }}
            >
              {step.lines[1]}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// tipAlign keeps the tooltip bubble from overflowing the box on the two
// edge categories -- it anchors to the icon's outer edge instead of centering.
// size/dsize are sized per icon's own SVG aspect ratio (not a forced square)
// so every icon's longest edge hits the same cap and they read as the same
// scale despite very different shapes (a wide plate vs. a tall thin pillar).
const CATEGORIES = [
  { label: "Bienestar", examples: ["masajes", "spa", "yoga"], src: "/images/box-includes/bienestar.svg", size: "w-[50px] h-[40px] sm:w-[68px] sm:h-[54px] md:w-[92px] md:h-[73px]", dsize: "w-[70px] h-[56px]", offset: "translate-y-2 md:translate-y-3", tipAlign: "left" },
  { label: "Aventura", examples: ["parapente", "rafting", "escalada"], src: "/images/box-includes/aventura.svg", size: "w-[50px] h-[34px] sm:w-[68px] sm:h-[46px] md:w-[92px] md:h-[62px]", dsize: "w-[70px] h-[47px]", offset: "-translate-y-3 md:-translate-y-4", tipAlign: "center" },
  { label: "Gastronomía", examples: ["brunch", "catas", "cocina"], src: "/images/box-includes/gastronomia.svg", size: "w-[50px] h-[37px] sm:w-[68px] sm:h-[50px] md:w-[92px] md:h-[67px]", dsize: "w-[70px] h-[51px]", offset: "translate-y-2 md:translate-y-3", tipAlign: "center" },
  { label: "Estancias", examples: ["glamping", "cabañas", "fincas"], src: "/images/box-includes/estancias.svg", size: "w-[50px] h-[36px] sm:w-[68px] sm:h-[49px] md:w-[92px] md:h-[66px]", dsize: "w-[70px] h-[50px]", offset: "-translate-y-3 md:-translate-y-4", tipAlign: "center" },
  { label: "Cultura", examples: ["tours", "talleres", "museos"], src: "/images/box-includes/cultura.svg", size: "w-[38px] h-[50px] sm:w-[51px] sm:h-[68px] md:w-[70px] md:h-[92px]", dsize: "w-[53px] h-[70px]", offset: "translate-y-2 md:translate-y-3", tipAlign: "right" },
] as const

const TIP_ALIGN_CLASS: Record<string, string> = {
  left: "left-0",
  center: "left-1/2 -translate-x-1/2",
  right: "right-0",
}

const TIP_ARROW_ALIGN_CLASS: Record<string, string> = {
  left: "left-4",
  center: "left-1/2 -translate-x-1/2",
  right: "right-4",
}

export default function WhatsIncluded() {

  // Bienestar starts active so the tooltip + underline are visible on load,
  // teaching visitors the icons are clickable. Unlike the content picker
  // below, category selection never auto-dismisses -- it only changes when
  // another category (or the same one again) is clicked.
  const [activeCategory, setActiveCategory] = useState<string | null>("Bienestar")

  const toggleCategory = (label: string) => {
    setActiveCategory((current) => (current === label ? null : label))
  }

  return (
    <section className="bg-surface">

      {/* BRIDGE — connects the hero's promise to the explanation below */}

      <div className="bg-ink py-5 md:py-6 px-0.5 md:px-8">

        <div className="max-w-[820px] mx-auto">
          <BridgeSteps />
        </div>

      </div>

      {/* QUÉ INCLUYE (mobile/tablet) — the box dominates, swipeable front/back/inside. Desktop (lg+) gets its own dedicated layout below. */}

      <div className="lg:hidden pt-10 md:pt-14 pb-2 md:pb-3">

        <div className="max-w-[1100px] mx-auto px-6">

          <h2 className="text-ink font-semibold leading-[1.1] tracking-tight mb-2">
            <div className="sm:hidden">
              <FitLine max={40} min={18}>
                Todo en una sola{" "}
                <span className="text-primary">c</span>
                <span className="text-accent-red">a</span>
                <span className="text-accent-green">j</span>
                <span className="text-accent-blue">a</span>
                <span className="text-violet-500">.</span>
              </FitLine>
            </div>
            <div className="hidden sm:block">
              <FitLine max={110} min={42}>
                Todo en una sola{" "}
                <span className="text-primary">c</span>
                <span className="text-accent-red">a</span>
                <span className="text-accent-green">j</span>
                <span className="text-accent-blue">a</span>
                <span className="text-violet-500">.</span>
              </FitLine>
            </div>
          </h2>

          <p className="text-ink/60 text-[15px] sm:text-[16px] md:text-[17px] max-w-[420px] mb-2 md:mb-3">
            Un regalo que siempre acierta.
          </p>

        </div>

        {/* BOX FACES — front, back, inside; swipe between them */}

        <div className="max-w-[560px] mx-auto px-4 sm:px-6 mt-3 md:mt-5">
          <BoxFacesCarousel sizes="(min-width: 560px) 560px, 100vw" />
        </div>

      </div>

      <div className="lg:hidden max-w-[1100px] mx-auto px-6">

        {/* GROUPING CONTAINER — border only, groups the categories title + grid */}

        <div className="mt-5 md:mt-8 border-2 border-[#3A2E22] rounded-[28px] sm:rounded-[36px] md:rounded-[48px] px-4 pt-4 pb-12 sm:px-8 sm:pt-6 sm:pb-16 md:px-12 md:pt-7 md:pb-20">

          {/* CATALOGUE CONTINUATION — categories read as an extension of "Para elegir.", not a new section */}

          <div className="max-w-[720px] mx-auto text-center">

            <p className="text-ink text-[clamp(15px,4.5vw,22px)] sm:text-[26px] md:text-[32px] font-semibold tracking-tight whitespace-nowrap">
              ¿Qué experiencias podrá elegir?
            </p>

          </div>

          <div className="mt-1 sm:mt-2 md:mt-3">

            <div data-category-picker className="grid grid-cols-5 gap-x-1 sm:gap-x-6 md:gap-x-10">

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => toggleCategory(cat.label)}
                  className={`relative flex flex-col items-center text-center ${cat.offset} transition-opacity ${activeCategory === cat.label ? "z-30 opacity-100" : activeCategory ? "opacity-70" : "opacity-100"}`}
                  aria-pressed={activeCategory === cat.label}
                  aria-label={`Ver ejemplos de ${cat.label}`}
                >
                  <div className="h-[50px] sm:h-[68px] md:h-[92px] flex items-end justify-center mb-0.5 md:mb-1">
                    <div className={`relative ${cat.size}`}>
                      <Image src={cat.src} alt="" fill sizes="92px" className="object-contain" />
                    </div>
                  </div>
                  <span className={`text-[12px] sm:text-[16px] md:text-[20px] font-medium leading-tight ${activeCategory === cat.label ? "text-primary underline" : "text-ink"}`}>
                    {cat.label}
                  </span>
                  <div
                    className={`absolute top-full mt-2 ${TIP_ALIGN_CLASS[cat.tipAlign]} z-20 transition-opacity duration-300 ${activeCategory === cat.label ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    aria-hidden={activeCategory !== cat.label}
                  >
                    <div className={`absolute bottom-full -mb-1 ${TIP_ARROW_ALIGN_CLASS[cat.tipAlign]} w-2 h-2 bg-ink rotate-45`} />
                    <div className="bg-ink text-white text-[11px] font-medium px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap first-letter:uppercase">
                      {cat.examples.join(", ")}…
                    </div>
                  </div>
                </button>
              ))}

            </div>

          </div>

        </div>

        <p className="mt-5 md:mt-6 text-muted text-[14px] sm:text-[15px] md:text-[16px] text-center">
          Se elige <span className="underline decoration-2 underline-offset-2 font-semibold text-primary">1</span> entre más de 50 experiencias en Bogotá y Cundinamarca.
        </p>

        {/* CTA — value understood first, price lives on the product page */}

        <div className="mt-6 md:mt-7 flex flex-col items-center text-center">

          <a
            href={`/cajas/${vivabox.slug}`}
            className="vb-btn-primary h-[54px] px-10 text-[17px]"
          >
            Ver precio y comprar
          </a>

          <p className="mt-5 md:mt-6 mb-6 md:mb-8 text-muted text-[13px] md:text-[14px]">
            Compra segura. Sin costos ocultos.
          </p>

        </div>

      </div>

      {/* QUÉ INCLUYE (desktop) — editorial product-reveal layout: one focal point per stage, reading top to bottom */}

      <div className="hidden lg:block pt-24 xl:pt-28 pb-20">

        <div className="max-w-[1200px] mx-auto px-8 xl:px-12">

          {/* STAGE 1+2 — headline and the box, side by side, nothing else competing */}

          <div className="grid grid-cols-[2fr_3fr] gap-16 xl:gap-24 items-center">

            <div>
              <h2 className="text-ink text-[54px] xl:text-[62px] font-semibold leading-[1.05] tracking-tight mb-6">
                Todo en una sola{" "}
                <span className="text-primary">c</span>
                <span className="text-accent-red">a</span>
                <span className="text-accent-green">j</span>
                <span className="text-accent-blue">a</span>
                <span className="text-violet-500">.</span>
              </h2>

              <p className="text-ink/50 text-[18px] leading-relaxed max-w-[340px]">
                Un regalo que siempre acierta.
              </p>
            </div>

            <div className="relative">

              <div className="w-full max-w-[440px] xl:max-w-[480px] mx-auto">
                <BoxFacesCarousel sizes="(min-width: 1280px) 480px, 440px" />
              </div>

            </div>

          </div>

          {/* STAGE 4 — experience categories, same bordered grouping as the mobile version */}

          <div className="mt-[52px] xl:mt-[60px] max-w-[960px] mx-auto border-2 border-[#3A2E22] rounded-[48px] px-12 pt-9 pb-16 xl:px-14 xl:pt-10 xl:pb-20 text-center">

            <p className="text-ink text-[30px] xl:text-[34px] font-semibold tracking-tight mb-3">
              ¿Qué experiencias podrá elegir?
            </p>

            <div data-category-picker className="flex justify-center gap-20 xl:gap-24">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => toggleCategory(cat.label)}
                  className={`relative flex flex-col items-center transition-opacity ${activeCategory === cat.label ? "z-30 opacity-100" : activeCategory ? "opacity-70" : "opacity-100"}`}
                  aria-pressed={activeCategory === cat.label}
                  aria-label={`Ver ejemplos de ${cat.label}`}
                >
                  <div className="h-[84px] flex items-end justify-center mb-4">
                    <div className={`relative ${cat.dsize}`}>
                      <Image src={cat.src} alt="" fill sizes="70px" className="object-contain" />
                    </div>
                  </div>
                  <span className={`text-[16px] font-medium ${activeCategory === cat.label ? "text-primary underline" : "text-ink"}`}>
                    {cat.label}
                  </span>
                  <div
                    className={`absolute top-full mt-2 ${TIP_ALIGN_CLASS[cat.tipAlign]} z-20 transition-opacity duration-300 ${activeCategory === cat.label ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    aria-hidden={activeCategory !== cat.label}
                  >
                    <div className={`absolute bottom-full -mb-1 ${TIP_ARROW_ALIGN_CLASS[cat.tipAlign]} w-2.5 h-2.5 bg-ink rotate-45`} />
                    <div className="bg-ink text-white text-[13px] font-medium px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap first-letter:uppercase">
                      {cat.examples.join(", ")}…
                    </div>
                  </div>
                </button>
              ))}
            </div>

          </div>

          <p className="mt-4 text-muted text-[14px] text-center">
            Se elige <span className="underline decoration-2 underline-offset-2 font-semibold text-primary">1</span> entre más de 50 experiencias en Bogotá y Cundinamarca.
          </p>

          {/* STAGE 5 — the purchase action, only after the product has been understood */}

          <div className="mt-16 flex flex-col items-center text-center">

            <a
              href={`/cajas/${vivabox.slug}`}
              className="h-[54px] px-10 rounded-xl bg-primary text-white text-[17px] font-semibold inline-flex items-center justify-center transition hover:bg-primary-hover shadow-[0_10px_35px_rgba(254,132,47,.35)]"
            >
              Ver precio y comprar
            </a>

            <p className="mt-6 text-muted text-[14px]">
              Compra segura. Sin costos ocultos.
            </p>

          </div>

        </div>

      </div>

      <BenefitsBar />

      {/* Y DESPUÉS — la experiencia continúa en la app */}

      <div className="vb-dark relative w-screen left-1/2 -translate-x-1/2 bg-ink">

        <div className="max-w-[1200px] mx-auto grid grid-cols-2 items-stretch h-[380px] sm:h-[420px] md:h-[460px] lg:h-[500px]">

          <div className="relative w-full h-full overflow-hidden" aria-label="App Vivabox para descubrir, elegir y reservar experiencias">
            <Image
              src="/images/app-phone/vivabox-app-experiencias.webp"
              alt="App Vivabox mostrando experiencias disponibles en Bogotá y Cundinamarca"
              fill
              sizes="(min-width: 1200px) 600px, 50vw"
              className="object-cover scale-110"
            />
          </div>

          <div className="flex flex-col justify-center px-4 sm:px-8 md:px-14 lg:px-20 text-left">

            <h2 className="text-white font-semibold tracking-tight leading-[1.05] text-[26px] sm:text-[32px] md:text-[42px] lg:text-[52px]">
              <span className="block">Explorar.</span>
              <span className="block">Elegir.</span>
              <span className="block">Reservar.</span>
            </h2>

            <div className="w-10 h-px bg-white/20 my-6 md:my-8" />

            <h3 className="text-white text-[16px] sm:text-[18px] md:text-[22px] lg:text-[25px] font-semibold leading-snug tracking-tight max-w-[360px] mb-3 md:mb-4">
              La experiencia continúa en la <span className="text-primary">app Vivabox</span>.
            </h3>

            <p className="text-white/70 text-[13px] sm:text-[15px] md:text-[16px] lg:text-[17px] leading-relaxed max-w-[400px]">
              Descubrirá todas las experiencias y podrá reservar con el acompañamiento del equipo Vivabox.
            </p>

          </div>

        </div>

      </div>

      <BrandRibbon />

    </section>
  )
}
