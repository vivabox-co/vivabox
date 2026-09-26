"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { prefetchBox3D } from "@/components/box3dAssets"
import { useCallback, useEffect, useRef, useState } from "react"

// Client-only and lazy: model-viewer + GLB are fetched only when someone picks 3D.
const Box3DViewer = dynamic(() => import("@/components/Box3DViewer"), { ssr: false })

// Front → back → inside → what's inside: the order someone discovers the box
// in real life. Images are cut out on a transparent background (shadow baked
// in), so they sit directly on the section's surface with no frame around them.
// Captions stay short: a bold label + a few words, read as one line.
export const BOX_FACES = [
  { src: "/images/box-includes/vivabox-caja-frente.webp", alt: "Caja de regalo Vivabox, vista de frente", title: "Por fuera", caption: "lista para regalar." },
  { src: "/images/box-includes/vivabox-caja-reverso.webp", alt: "Reverso de la caja Vivabox: cómo funciona el regalo", title: "Atrás", caption: "cómo funciona, en 4 pasos." },
  { src: "/images/box-includes/vivabox-caja-interior.webp", alt: "Interior de la caja Vivabox con el mensaje «Esto es solo el principio»", title: "Al abrirla", caption: "empieza la sorpresa." },
  { src: "/images/box-includes/vivabox-caja-catalogo.webp", alt: "Catálogo de experiencias Vivabox", title: "El catálogo", caption: "ejemplos de experiencias para elegir." },
  { src: "/images/box-includes/vivabox-caja-codigo.webp", alt: "Tarjeta con código QR y código de activación Vivabox", title: "El código", caption: "para activar el regalo." },
  { src: "/images/box-includes/vivabox-caja-mensaje.webp", alt: "Tarjeta con mensaje personal dentro de la caja Vivabox", title: "Un mensaje", caption: "para hacerlo aún más personal." },
] as const

type Face = (typeof BOX_FACES)[number]

type BoxFacesCarouselProps = {
  sizes: string
  // Defaults to all six faces (homepage). Pass a subset — e.g. just front
  // and back — for tighter spots like the product hero.
  faces?: readonly Face[]
  // "dark" swaps caption/dot colors for white text over a photo background.
  theme?: "light" | "dark"
  // Drops the arrows and tightens caption/dot spacing for small containers
  // where the full-size controls would collide with neighboring content.
  compact?: boolean
  // Hide the "Por fuera, lista para regalar." label under the image —
  // some spots just want the swipeable photos and dots.
  showCaption?: boolean
  // Extra classes on the image track only, e.g. to shrink the photos on
  // mobile while the caption and dots keep the full container width.
  imageClassName?: string
  // Adds a Fotos / 3D switch under the carousel (homepage only for now).
  enable3D?: boolean
}

export default function BoxFacesCarousel({
  sizes,
  faces = BOX_FACES,
  theme = "light",
  compact = false,
  showCaption = true,
  imageClassName = "",
  enable3D = false,
}: BoxFacesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<"fotos" | "3d">("fotos")
  const is3D = enable3D && mode === "3d"
  const [ready3D, setReady3D] = useState(false)
  const on3DLoaded = useCallback(() => setReady3D(true), [])

  const isDark = theme === "dark"

  // Active face derived from scroll position (one face = one track width),
  // so swipe, trackpad, dots and arrows all stay in sync with a single source.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const update = () => setActive(Math.round(track.scrollLeft / track.clientWidth))
    track.addEventListener("scroll", update, { passive: true })
    return () => track.removeEventListener("scroll", update)
  }, [is3D])

  // Warm the 3D up once the section is about to enter the screen (skipped on slow / data-saver connections).
  useEffect(() => {
    const region = regionRef.current
    if (!enable3D || !region) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          prefetchBox3D()
          io.disconnect()
        }
      },
      { rootMargin: "600px" },
    )
    io.observe(region)
    return () => io.disconnect()
  }, [enable3D])

  const goTo = (index: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(faces.length - 1, index))
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" })
  }

  const arrowClass =
    "hidden lg:flex absolute top-[calc(50%-14px)] -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/80 text-ink shadow-[0_4px_14px_rgba(24,20,15,0.12)] transition hover:bg-white disabled:opacity-0 disabled:pointer-events-none"

  const dots = faces.map((face, i) => (
    <button
      key={face.src}
      type="button"
      onClick={() => goTo(i)}
      aria-label={`Ver cara ${i + 1}`}
      aria-current={active === i}
      className={compact ? "p-1" : "p-1.5"}
    >
      <span
        className={`block rounded-full transition-all duration-300 ${compact ? "h-1.5" : "h-2"} ${
          active === i
            ? `${compact ? "w-4" : "w-6"} ${isDark ? "bg-white" : "bg-ink"}`
            : `${compact ? "w-1.5" : "w-2"} ${isDark ? "bg-white/35" : "bg-ink/25"}`
        }`}
      />
    </button>
  ))

  return (
    <div ref={regionRef} role="region" aria-roledescription="carrusel" aria-label="Caja Vivabox por fuera y por dentro">

      <div className={`relative ${imageClassName}`}>

        {/* Same square as a slide, with the "Por fuera" photo held there until the 3D is ready, so the layout never jumps. */}
        {is3D && (
          <div className="relative z-10 w-full aspect-square">
            <Image
              src={faces[0].src}
              alt=""
              fill
              sizes={sizes}
              draggable={false}
              className={`object-contain select-none transition-opacity duration-500 ${ready3D ? "opacity-0" : "opacity-100"}`}
            />
            <Box3DViewer onLoaded={on3DLoaded} />
          </div>
        )}

        {!is3D && <div
          ref={trackRef}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
        >
          {faces.map((face, i) => (
            <div
              key={face.src}
              className="relative w-full aspect-square shrink-0 snap-center [scroll-snap-stop:always]"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${faces.length}`}
            >
              <Image
                src={face.src}
                alt={face.alt}
                fill
                sizes={sizes}
                draggable={false}
                loading={i < 2 ? "eager" : undefined}
                className="object-contain select-none"
              />
            </div>
          ))}
        </div>}

        {!compact && !is3D && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="Cara anterior"
              className={`${arrowClass} left-0 -translate-x-1/2`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </button>

            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active === faces.length - 1}
              aria-label="Cara siguiente"
              className={`${arrowClass} right-0 translate-x-1/2`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </>
        )}

        {/* Compact usage (product hero) floats the dots under the image with
            absolute positioning instead of a normal-flow row, so they don't
            add to the box's layout height — keeping it the same height as
            the image itself, which is what lets it sit truly centered next
            to the checklist beside it instead of drifting up. */}
        {compact && (
          <div className="absolute inset-x-0 top-full mt-2 flex justify-center gap-1.5">
            {dots}
          </div>
        )}

      </div>

      {/* CAPTION — a single element synced to the active slide, not one per
          face inside the scroller. A caption-per-face used to sit inside the
          horizontally-scrolling flex row; a flex row's height is set by its
          tallest child even when that child is scrolled off-screen, so on
          narrow phones the longer "El catálogo…" caption (wraps to 2 lines)
          was inflating the row height behind whichever shorter caption was
          actually showing, pushing the dots down by a variable, unpredictable
          amount. A single caption outside the row has only its own height to
          answer for, so the gap to the dots is the same on every slide and
          every viewport. */}

      {showCaption && !is3D && (
        <p className={compact ? "mt-1.5 px-2 text-center text-[12px] leading-snug" : "-mt-3 sm:-mt-1 px-6 text-center text-[15px] md:text-[16px] leading-snug"}>
          <span className={`font-semibold ${isDark ? "text-white" : "text-ink"}`}>{faces[active].title}</span>
          <span className={isDark ? "text-white/60" : "text-ink/55"}>, {faces[active].caption}</span>
        </p>
      )}

      {/* DOTS (normal flow — homepage usage only; compact renders them above, overlaid) */}

      {is3D && (
        <p className="-mt-3 sm:-mt-1 px-6 text-center text-[15px] md:text-[16px] leading-snug text-ink/55">
          <span className="relative">
            Arrástrala para girarla.
            {!ready3D && (
              <span
                role="status"
                aria-label="Cargando la caja en 3D"
                className="absolute left-full top-1/2 ml-2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-ink/15 border-t-ink/55"
              />
            )}
          </span>
        </p>
      )}

      {!compact && !is3D && (
        <div className="mt-3 sm:mt-7 lg:mt-[52px] xl:mt-[60px] flex justify-center gap-2">
          {dots}
        </div>
      )}

      {enable3D && (
        <div
          role="group"
          aria-label="Tipo de vista"
          className={`${is3D ? "mt-12 sm:mt-16 lg:mt-[88px] xl:mt-[96px]" : "mt-4"} relative z-20 mx-auto flex w-fit rounded-full bg-ink/[0.06] p-1 text-[14px]`}
        >
          {(["fotos", "3d"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m)
                if (m === "3d" && mode !== "3d") {
                  setReady3D(false)
                  ;(window as Window & { __box3dClickAt?: number }).__box3dClickAt = performance.now()
                }
              }}
              aria-pressed={mode === m}
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                mode === m ? "bg-white text-ink shadow-sm" : "text-ink/55 hover:text-ink"
              }`}
            >
              {m === "fotos" ? "Fotos" : "Ver en 3D"}
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
