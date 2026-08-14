"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import BrandRibbon from "@/components/ui/BrandRibbon"
import BenefitsBar from "@/components/BenefitsBar"
import { boxes } from "@/data/boxes"

const vivabox = boxes[0]

// Scales its content to the exact font-size that fills the container width
// on a single line — measured live, so it always fits regardless of glyph
// metrics (colored per-letter spans break normal kerning estimates).
function FitLine({
  children,
  min,
  max,
  className = "",
}: {
  children: React.ReactNode
  min: number
  max: number
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [fontSize, setFontSize] = useState(max)

  useEffect(() => {
    const container = containerRef.current
    const text = textRef.current
    if (!container || !text) return

    const measureAt = (size: number) => {
      text.style.fontSize = `${size}px`
      return text.scrollWidth
    }

    const fit = () => {
      const containerWidth = container.clientWidth
      if (containerWidth === 0) return

      const naturalWidth = measureAt(max)
      if (naturalWidth === 0) return
      let size = Math.min(max, Math.max(min, max * (containerWidth / naturalWidth)))

      // Re-measure at the computed size and correct any residual mismatch
      // (font metrics can shift slightly between sizes, especially right
      // after a web font swaps in), so the line never overflows its box.
      const measuredWidth = measureAt(size)
      if (measuredWidth > 0) {
        size = Math.min(max, Math.max(min, size * (containerWidth / measuredWidth)))
      }

      setFontSize(size)
    }

    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(container)
    return () => ro.disconnect()
  }, [min, max])

  return (
    <div ref={containerRef} className="w-full">
      <span
        ref={textRef}
        className={`inline-block whitespace-nowrap ${className}`}
        style={{ fontSize }}
      >
        {children}
      </span>
    </div>
  )
}

// Two fixed lines (chosen break point, never re-wrapped by the browser) —
// scaled up together as large as possible while neither line overflows the
// container. Like FitLine above, but fitting the widest of two nowrap lines
// instead of a single one, so the break point stays exactly where intended
// instead of wherever the browser's greedy wrap happens to land.
function FitLines({
  lines,
  min,
  max,
  heightRef,
  className = "",
}: {
  lines: [string, string]
  min: number
  max: number
  heightRef?: React.RefObject<HTMLElement | null>
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const [fontSize, setFontSize] = useState(max)

  useEffect(() => {
    const container = containerRef.current
    const line1 = line1Ref.current
    const line2 = line2Ref.current
    if (!container || !line1 || !line2) return

    const measureWidestAt = (size: number) => {
      line1.style.fontSize = `${size}px`
      line2.style.fontSize = `${size}px`
      return Math.max(line1.scrollWidth, line2.scrollWidth)
    }

    const fit = () => {
      const containerWidth = container.clientWidth
      if (containerWidth === 0) return

      const naturalWidth = measureWidestAt(max)
      if (naturalWidth === 0) return
      let size = Math.min(max, Math.max(min, max * (containerWidth / naturalWidth)))

      const measuredWidth = measureWidestAt(size)
      if (measuredWidth > 0) {
        size = Math.min(max, Math.max(min, size * (containerWidth / measuredWidth)))
      }

      // Cap total 2-line height to the reference element's height (the step
      // number) so the text block never grows taller than it, which is what
      // made it look oversized/off-center next to the number.
      const capHeight = heightRef?.current?.getBoundingClientRect().height
      if (capHeight) {
        line1.style.fontSize = `${size}px`
        const lineHeight = parseFloat(getComputedStyle(line1).lineHeight)
        const totalHeight = lineHeight * 2
        if (totalHeight > capHeight) {
          size = Math.max(min, size * (capHeight / totalHeight))
        }
      }

      setFontSize(size)
    }

    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(container)
    return () => ro.disconnect()
  }, [lines, min, max, heightRef])

  return (
    <div ref={containerRef} className="flex-1 min-w-0">
      <span ref={line1Ref} className={`block whitespace-nowrap ${className}`} style={{ fontSize }}>
        {lines[0]}
      </span>
      <span ref={line2Ref} className={`block whitespace-nowrap ${className}`} style={{ fontSize }}>
        {lines[1]}
      </span>
    </div>
  )
}

// Step number + its 2-line label, kept the same height as the number via
// FitLines' heightRef so the pair always reads as one balanced unit.
function BridgeStep({ number, lines }: { number: string; lines: [string, string] }) {
  const numberRef = useRef<HTMLSpanElement>(null)

  return (
    <div className="flex-1 min-w-0 flex items-center justify-center gap-1.5 md:gap-3">
      <span
        ref={numberRef}
        className="text-primary font-condensed font-semibold text-[26px] md:text-[40px] leading-none shrink-0"
      >
        {number}
      </span>
      <FitLines
        lines={lines}
        min={8}
        max={14}
        heightRef={numberRef}
        className="text-white/90 leading-none text-left"
      />
    </div>
  )
}

const INCLUDED_CARD_SIZES = "(min-width: 1024px) 240px, 34vw"

function IncludedCard({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  return (
    <div className="group relative w-full aspect-square overflow-hidden rounded-[26px] border border-[var(--nm-border)] bg-[var(--color-card)] shadow-[6px_10px_24px_rgba(24,20,15,0.18)]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={INCLUDED_CARD_SIZES}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
    </div>
  )
}

// tipAlign keeps the tooltip bubble from overflowing the box on the two
// edge categories -- it anchors to the icon's outer edge instead of centering.
// size/dsize are sized per icon's own SVG aspect ratio (not a forced square)
// so every icon's longest edge hits the same cap and they read as the same
// scale despite very different shapes (a wide plate vs. a tall thin pillar).
const CATEGORIES = [
  { label: "Bienestar", examples: ["masajes", "spa", "yoga"], src: "/images/box-includes/Bienestar.svg", size: "w-[50px] h-[40px] sm:w-[68px] sm:h-[54px] md:w-[92px] md:h-[73px]", dsize: "w-[70px] h-[56px]", offset: "translate-y-2 md:translate-y-3", tipAlign: "left" },
  { label: "Aventura", examples: ["parapente", "rafting", "escalada"], src: "/images/box-includes/Aventura.svg", size: "w-[50px] h-[34px] sm:w-[68px] sm:h-[46px] md:w-[92px] md:h-[62px]", dsize: "w-[70px] h-[47px]", offset: "-translate-y-3 md:-translate-y-4", tipAlign: "center" },
  { label: "Gastronomía", examples: ["brunch", "catas", "cocina"], src: "/images/box-includes/Gastronomía.svg", size: "w-[50px] h-[37px] sm:w-[68px] sm:h-[50px] md:w-[92px] md:h-[67px]", dsize: "w-[70px] h-[51px]", offset: "translate-y-2 md:translate-y-3", tipAlign: "center" },
  { label: "Estancias", examples: ["glamping", "cabañas", "fincas"], src: "/images/box-includes/Estancias.svg", size: "w-[50px] h-[36px] sm:w-[68px] sm:h-[49px] md:w-[92px] md:h-[66px]", dsize: "w-[70px] h-[50px]", offset: "-translate-y-3 md:-translate-y-4", tipAlign: "center" },
  { label: "Cultura", examples: ["tours", "talleres", "museos"], src: "/images/box-includes/Cultura.svg", size: "w-[38px] h-[50px] sm:w-[51px] sm:h-[68px] md:w-[70px] md:h-[92px]", dsize: "w-[53px] h-[70px]", offset: "translate-y-2 md:translate-y-3", tipAlign: "right" },
] as const

// The three guaranteed box contents — tapped from both the mobile illustration
// and the desktop grid, so the copy and images live here once and feed both.
const CONTENTS = [
  {
    title: "Catálogo",
    subtitle: "De experiencias.",
    desc: "Una selección para descubrir todo lo que podría vivir.",
    src: "/images/box-includes/vivabox-catalogo-experiencias.png",
    alt: "Catálogo de experiencias Vivabox",
  },
  {
    title: "Mensaje",
    subtitle: "Personal.",
    desc: "Unas palabras tuyas para hacer el regalo aún más personal.",
    src: "/images/box-includes/vivabox-dedicatoria-personal.png",
    alt: "Dedicatoria personalizada Vivabox",
  },
  {
    title: "Activación",
    subtitle: "Código único.",
    desc: "Le da acceso a su catálogo completo de experiencias en línea.",
    src: "/images/box-includes/vivabox-codigo-activacion.png",
    alt: "Código de activación Vivabox",
  },
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
  const [activeContent, setActiveContent] = useState<string | null>(null)

  const toggleCategory = (label: string) => {
    setActiveCategory((current) => (current === label ? null : label))
  }

  const toggleContent = (title: string) => {
    setActiveContent((current) => (current === title ? null : title))
  }

  // The shared caption strip (mobile + desktop) reads from whichever content
  // item was last tapped -- unlike the category tooltip, it's a persistent
  // line rather than a floating bubble, so it doesn't need to auto-dismiss.
  const activeContentData = CONTENTS.find((item) => item.title === activeContent) ?? null

  return (
    <section className="bg-surface">

      {/* BRIDGE — connects the hero's promise to the explanation below */}

      <div className="bg-ink py-4 md:py-5 px-4 md:px-8">

        <div className="max-w-[820px] mx-auto flex items-center justify-between gap-1 sm:gap-6 md:gap-8">

          <BridgeStep number="01" lines={["Tú regalas", "una Vivabox."]} />

          <span className="shrink-0 w-px h-8 md:h-10 bg-white/15" aria-hidden="true" />

          <BridgeStep number="02" lines={["La persona", "elige 1 plan."]} />

          <span className="shrink-0 w-px h-8 md:h-10 bg-white/15" aria-hidden="true" />

          <BridgeStep number="03" lines={["Facilitamos", "la reserva."]} />

        </div>

      </div>

      {/* QUÉ INCLUYE (mobile/tablet) — the box dominates, three objects rest beside it as if just lifted out. Desktop (lg+) gets its own dedicated layout below. */}

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

        {/* PRODUCT SHOT — full-bleed breakout: box and cards read at maximum scale, the two end cards nearly touching the viewport edges */}

        <div className="relative w-screen left-1/2 -translate-x-1/2 px-4 sm:px-6 md:px-10 mt-3 md:mt-5">

          <div className="relative w-full max-w-[1440px] mx-auto pt-0 md:pt-1">

            <div className="relative w-full aspect-[10/13.5]">

              {/* BOX — hero, slight 3D perspective, never frontal-flat, centered at 50%/26% */}

              <div
                className="absolute left-[12%] top-[-3.5%] w-[76%] aspect-square z-10"
                style={{ transform: "perspective(1400px) rotateX(7deg) rotateY(-9deg) rotate(-3deg)" }}
              >
                <Image
                  src="/images/box-includes/vivabox-caja-regalo.png"
                  alt="Caja de regalo Vivabox con catálogo de experiencias"
                  fill
                  sizes="76vw"
                  className="object-contain drop-shadow-[18px_10px_14px_rgba(24,20,15,0.22)]"
                  priority
                />
              </div>

              {/* CATALOGUE — left card, nearly at the frame's left edge */}

              <div
                className="absolute left-[2%] top-[67%] w-[34%] aspect-square z-10 cursor-pointer"
                onClick={() => toggleContent(CONTENTS[0].title)}
              >
                <div className="absolute inset-x-[22%] -bottom-[1.5%] h-[6%] rounded-[100%] bg-ink/20 blur-md" />
                <div className="-rotate-3">
                  <IncludedCard
                    src={CONTENTS[0].src}
                    alt={CONTENTS[0].alt}
                  />
                </div>
              </div>

              {/* PERSONAL MESSAGE — center card, real gaps on both sides */}

              <div
                className="absolute left-[33%] top-[68%] w-[34%] aspect-square z-20 cursor-pointer"
                onClick={() => toggleContent(CONTENTS[1].title)}
              >
                <div className="absolute inset-x-[22%] -bottom-[1.5%] h-[6%] rounded-[100%] bg-ink/20 blur-md" />
                <div className="rotate-1">
                  <IncludedCard
                    src={CONTENTS[1].src}
                    alt={CONTENTS[1].alt}
                  />
                </div>
              </div>

              {/* ACTIVATION CARD — right card, nearly at the frame's right edge */}

              <div
                className="absolute left-[64%] top-[67.5%] w-[34%] aspect-square z-10 cursor-pointer"
                onClick={() => toggleContent(CONTENTS[2].title)}
              >
                <div className="absolute inset-x-[22%] -bottom-[1.5%] h-[6%] rounded-[100%] bg-ink/20 blur-md" />
                <div className="rotate-2">
                  <IncludedCard
                    src={CONTENTS[2].src}
                    alt={CONTENTS[2].alt}
                  />
                </div>
              </div>

              {/* CONNECTOR ARROWS — hand-drawn curves, pulled outward past the box's edges so they clear it, pointing down to introduce "Dentro encontrará" */}
              <div className="absolute z-30 left-[9%] top-[44%] w-[14%] aspect-[184/177] -rotate-[24deg] pointer-events-none">
                <Image src="/images/box-includes/arrow-curv-left.png" alt="" fill sizes="14vw" className="object-contain" aria-hidden="true" />
              </div>
              <div className="absolute z-30 left-[79%] top-[44%] w-[14%] aspect-[184/177] rotate-[24deg] pointer-events-none">
                <Image src="/images/box-includes/arrow-curv-right.png" alt="" fill sizes="14vw" className="object-contain" aria-hidden="true" />
              </div>

              {/* Dentro encontrarás — small section lead-in, centered between the box and the three cards */}
              <p className="absolute z-40 inset-x-0 top-[51.2%] text-center text-accent-red font-hand text-[23px] sm:text-[28px] md:text-[34px] leading-snug">
                Dentro <span className="underline">encontrará</span>:
              </p>

              {/* Titles are also tap targets — the description itself surfaces
                  in the shared caption strip below the illustration, not in a
                  bubble anchored to the title. */}
              {CONTENTS.map((item, i) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => toggleContent(item.title)}
                  aria-pressed={activeContent === item.title}
                  aria-label={`Ver qué es ${item.title}`}
                  className={`absolute z-40 ${["left-[2%]", "left-[33%]", "left-[64%]"][i]} top-[59.5%] w-[34%] text-center leading-snug`}
                >
                  <h3 className={`font-sans font-semibold text-[17px] sm:text-[19px] md:text-[22px] tracking-tight text-ink ${activeContent === item.title ? "underline" : ""}`}>
                    {item.title}
                  </h3>
                </button>
              ))}

            </div>

          </div>

        </div>

        {/* SHARED CAPTION — appears only once something's tapped; the <p> stays
            a plain block so its spans wrap as normal inline text (flex here
            would turn each span into its own row instead of one paragraph). */}
        {activeContentData && (
          <div className="max-w-[1100px] mx-auto px-6 -mt-1 mb-4 md:mb-5">
            <p className="text-[13px] sm:text-[14px] leading-snug text-center">
              <span className="font-semibold text-ink">{activeContentData.title}</span>
              <span className="text-muted"> — {activeContentData.desc}</span>
            </p>
          </div>
        )}

      </div>

      <div className="lg:hidden max-w-[1100px] mx-auto px-6">

        {/* GROUPING CONTAINER — border only, groups the categories title + grid */}

        <div className="-mt-2 sm:-mt-6 md:-mt-9 border-2 border-[#3A2E22] rounded-[28px] sm:rounded-[36px] md:rounded-[48px] px-4 pt-4 pb-12 sm:px-8 sm:pt-6 sm:pb-16 md:px-12 md:pt-7 md:pb-20">

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
                    <div className="bg-ink text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap first-letter:uppercase">
                      {cat.examples.join(", ")}…
                    </div>
                  </div>
                </button>
              ))}

            </div>

          </div>

        </div>

        <p className="mt-5 md:mt-6 text-muted text-[14px] sm:text-[15px] md:text-[16px] text-center">
          Se elige <span className="underline decoration-2 underline-offset-2 font-semibold text-primary">1</span> entre más de 20 experiencias en Bogotá y Cundinamarca.
        </p>

        {/* CTA — editorial, no price shown here */}

        <div className="mt-8 md:mt-10 flex flex-col items-center text-center">

          <div className="w-10 h-px bg-ink/10 mb-3 md:mb-4" />

          <a
            href={`/proximamente?next=/cajas/${vivabox.slug}`}
            className="vb-btn-primary h-[54px] px-10 text-[17px]"
          >
            Comprar Vivabox
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

              <div
                className="relative w-full max-w-[440px] xl:max-w-[480px] mx-auto aspect-square"
                style={{ transform: "perspective(1400px) rotateX(6deg) rotateY(-8deg) rotate(-2deg)" }}
              >
                <Image
                  src="/images/box-includes/vivabox-caja-regalo.png"
                  alt="Caja de regalo Vivabox con catálogo de experiencias"
                  fill
                  sizes="(min-width: 1280px) 480px, 440px"
                  className="object-contain drop-shadow-[0_30px_36px_rgba(24,20,15,0.16)]"
                  priority
                />
              </div>

            </div>

          </div>

          {/* STAGE 3 — what's inside, as one clean product system: same size, same radius, same shadow, aligned on a grid */}

          <div className="mt-24 xl:mt-28">

            <p className="text-center text-ink/40 text-[13px] font-semibold tracking-[0.16em] uppercase mb-10">
              Dentro encontrarás
            </p>

            <div className="grid grid-cols-3 gap-8 xl:gap-10 max-w-[760px] mx-auto">

              {CONTENTS.map((item) => (
                <div
                  key={item.title}
                  className="text-center cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  aria-pressed={activeContent === item.title}
                  aria-label={`Ver qué es ${item.title}`}
                  onClick={() => toggleContent(item.title)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleContent(item.title)
                    }
                  }}
                >
                  <div className="vb-card relative w-full aspect-square overflow-hidden mb-4">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="230px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <h3 className={`font-sans font-semibold text-[18px] tracking-tight text-ink ${activeContent === item.title ? "underline" : ""}`}>
                    {item.title}
                  </h3>
                  <p className="font-sans text-ink/50 text-[14px] mt-1">
                    {item.subtitle}
                  </p>
                </div>
              ))}

            </div>

            {/* SHARED CAPTION — same pattern as the mobile layout: appears only
                once something's tapped, plain block so text wraps normally. */}
            {activeContentData && (
              <p className="text-center text-[15px] leading-snug mt-1 mb-8">
                <span className="font-semibold text-ink">{activeContentData.title}</span>
                <span className="text-ink/50"> — {activeContentData.desc}</span>
              </p>
            )}

          </div>

          {/* STAGE 4 — experience categories, same bordered grouping as the mobile version */}

          <div className="mt-28 xl:mt-32 max-w-[960px] mx-auto border-2 border-[#3A2E22] rounded-[48px] px-12 pt-9 pb-16 xl:px-14 xl:pt-10 xl:pb-20 text-center">

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
                    <div className="bg-ink text-white text-[13px] font-medium px-3.5 py-2 rounded-lg shadow-lg whitespace-nowrap first-letter:uppercase">
                      {cat.examples.join(", ")}…
                    </div>
                  </div>
                </button>
              ))}
            </div>

          </div>

          <p className="mt-4 text-muted text-[14px] text-center">
            Se elige <span className="underline decoration-2 underline-offset-2 font-semibold text-primary">1</span> entre más de 20 experiencias en Bogotá y Cundinamarca.
          </p>

          {/* STAGE 5 — the purchase action, only after the product has been understood */}

          <div className="mt-20 flex flex-col items-center text-center">

            <div className="w-10 h-px bg-ink/10 mb-5" />

            <a
              href={`/proximamente?next=/cajas/${vivabox.slug}`}
              className="h-[54px] px-10 rounded-xl bg-primary text-white text-[17px] font-semibold inline-flex items-center justify-center transition hover:bg-primary-hover shadow-[0_10px_35px_rgba(254,132,47,.35)]"
            >
              Comprar Vivabox
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

        <div className="max-w-[1200px] mx-auto grid grid-cols-2 items-stretch h-[480px] sm:h-[520px] md:h-[560px] lg:h-[620px]">

          <div className="relative w-full h-full" aria-label="App Vivabox para descubrir, elegir y reservar experiencias">
            <Image
              src="/images/app-phone/vivabox-app-experiencias.png"
              alt="App Vivabox mostrando experiencias disponibles en Bogotá y Cundinamarca"
              fill
              sizes="(min-width: 1200px) 600px, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center px-4 sm:px-8 md:px-14 lg:px-20 text-left -translate-y-6 sm:-translate-y-8 md:-translate-y-10 lg:-translate-y-12">

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
