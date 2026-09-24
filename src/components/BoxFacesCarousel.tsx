"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

// Front → back → inside → what's inside: the order someone discovers the box
// in real life. Images are cut out on a transparent background (shadow baked
// in), so they sit directly on the section's surface with no frame around them.
// Captions stay short: a bold label + a few words, read as one line.
const FACES = [
  { src: "/images/box-includes/vivabox-caja-frente.webp", alt: "Caja de regalo Vivabox, vista de frente", title: "Por fuera", caption: "lista para regalar." },
  { src: "/images/box-includes/vivabox-caja-reverso.webp", alt: "Reverso de la caja Vivabox: cómo funciona el regalo", title: "Atrás", caption: "cómo funciona, en 4 pasos." },
  { src: "/images/box-includes/vivabox-caja-interior.webp", alt: "Interior de la caja Vivabox con el mensaje «Esto es solo el principio»", title: "Al abrirla", caption: "empieza la sorpresa." },
  { src: "/images/box-includes/vivabox-caja-catalogo.webp", alt: "Catálogo de experiencias Vivabox", title: "El catálogo", caption: "ejemplos de experiencias para elegir." },
  { src: "/images/box-includes/vivabox-caja-codigo.webp", alt: "Tarjeta con código QR y código de activación Vivabox", title: "El código", caption: "para activar el regalo." },
  { src: "/images/box-includes/vivabox-caja-mensaje.webp", alt: "Tarjeta con mensaje personal dentro de la caja Vivabox", title: "Un mensaje", caption: "para hacerlo aún más personal." },
] as const

export default function BoxFacesCarousel({ sizes }: { sizes: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // Active face derived from scroll position (one face = one track width),
  // so swipe, trackpad, dots and arrows all stay in sync with a single source.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const update = () => setActive(Math.round(track.scrollLeft / track.clientWidth))
    track.addEventListener("scroll", update, { passive: true })
    return () => track.removeEventListener("scroll", update)
  }, [])

  const goTo = (index: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(FACES.length - 1, index))
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" })
  }

  const arrowClass =
    "hidden lg:flex absolute top-[calc(50%-14px)] -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/80 text-ink shadow-[0_4px_14px_rgba(24,20,15,0.12)] transition hover:bg-white disabled:opacity-0 disabled:pointer-events-none"

  return (
    <div role="region" aria-roledescription="carrusel" aria-label="Caja Vivabox por fuera y por dentro">

      <div className="relative">

        <div
          ref={trackRef}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
        >
          {FACES.map((face, i) => (
            <div
              key={face.src}
              className="w-full shrink-0 snap-center [scroll-snap-stop:always]"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${FACES.length}`}
            >
              <div className="relative w-full aspect-square">
                <Image
                  src={face.src}
                  alt={face.alt}
                  fill
                  sizes={sizes}
                  draggable={false}
                  className="object-contain select-none"
                />
              </div>
              <p className="-mt-1 px-6 text-center text-[15px] md:text-[16px] leading-snug">
                <span className="font-semibold text-ink">{face.title}</span>
                <span className="text-ink/55">, {face.caption}</span>
              </p>
            </div>
          ))}
        </div>

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
          disabled={active === FACES.length - 1}
          aria-label="Cara siguiente"
          className={`${arrowClass} right-0 translate-x-1/2`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
        </button>

      </div>

      {/* DOTS */}

      <div className="mt-2 flex justify-center gap-2">
        {FACES.map((face, i) => (
          <button
            key={face.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ver cara ${i + 1}`}
            aria-current={active === i}
            className="p-1.5"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${active === i ? "w-6 bg-ink" : "w-2 bg-ink/25"}`}
            />
          </button>
        ))}
      </div>

    </div>
  )
}
