"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { formatPrice } from "@/utils/formatPrice"
import { Check, Lock, Minus, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"

type BoxHeroProps = {
  name: string
  price: number
  experiences: number
  image: string
  slug: string
}

// Real, colorful experience photos for the rotating hero background.
// Picked by hand across categories for visual variety and "peps".
const HERO_GALLERY_IMAGES = [
  "/images/experiencias-reales/brunch-bogota-vivabox/brunch-bogota-vivabox-1.webp",
  "/images/experiencias-reales/cabalgata-parrillada-la-calera-vivabox/cabalgata-parrillada-la-calera-vivabox-1.webp",
  "/images/experiencias-reales/cena-carnes-bogota-vivabox/cena-carnes-bogota-vivabox-1.webp",
  "/images/experiencias-reales/escalada-rocas-suesca-vivabox/escalada-rocas-suesca-vivabox-1.webp",
  "/images/experiencias-reales/motocross-tocancipa-vivabox/motocross-tocancipa-vivabox-1.webp",
  "/images/experiencias-reales/pasteles-cafe-bogota-vivabox/pasteles-cafe-bogota-vivabox-1.webp",
  "/images/experiencias-reales/refugio-montana-choachi-vivabox/refugio-montana-choachi-vivabox-1.webp",
  "/images/experiencias-reales/taller-cata-cacao-bogota-vivabox/taller-cata-cacao-bogota-vivabox-1.webp",
]

const HERO_GALLERY_INTERVAL_MS = 5000

export default function BoxHero({
  name,
  price,
  experiences,
  image,
  slug,
}: BoxHeroProps) {

  const router = useRouter()

  const quantity = useCheckoutStore((s) => s.quantity)
  const setQuantity = useCheckoutStore((s) => s.setQuantity)
  const setBox = useCheckoutStore((s) => s.setBox)

  useEffect(() => {
    setBox({ slug, name, price })
  }, [slug, name, price, setBox])

  const [heroImageIndex, setHeroImageIndex] = useState(0)

  useEffect(() => {
    // Users who ask their OS for reduced motion get a static hero instead
    // of a rotating one -- the fades can feel unpleasant or disorienting.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const id = setInterval(() => {
      setHeroImageIndex((i) => (i + 1) % HERO_GALLERY_IMAGES.length)
    }, HERO_GALLERY_INTERVAL_MS)

    return () => clearInterval(id)
  }, [])

  const increase = () => setQuantity(Math.min(10, quantity + 1))
  const decrease = () => setQuantity(Math.max(1, quantity - 1))

  const subtotal = price * quantity

  const handleCheckout = () => {
    router.push(`/checkout/${slug}`)
  }

  return (
    <section id="box-hero" className="relative overflow-hidden pt-24 md:pt-28 pb-6 md:pb-8">

      {/* BACKGROUND IMAGE GALLERY */}
      <div className="absolute inset-0 -z-10">
        {HERO_GALLERY_IMAGES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt="Experiencias reales Vivabox"
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover blur-[5px] brightness-[0.8] scale-110 transition-opacity duration-[1800ms] ease-in-out ${
              i === heroImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-[720px] mx-auto px-6">

        {/* TEXT */}
        <div className="text-white">

          <h1 className="h1 mb-3 max-w-[440px]">
            Tu regalo ya casi está listo.
          </h1>

          <div className="h-[3px] w-12 rounded-full bg-primary my-4" />

          <p className="text-[22px] sm:text-[26px] font-semibold mb-6">
            ${formatPrice(price)} COP
          </p>

          {/* BOX + CHECKLIST */}
          <div className="flex items-center gap-0 sm:gap-2 mb-6">

            <div className="shrink-0 w-[190px] sm:w-[280px] md:w-[340px] -ml-6 sm:ml-0">
              <Image
                src={image}
                alt={name}
                width={320}
                height={320}
                className="w-full h-auto object-contain drop-shadow-[0_40px_50px_rgba(0,0,0,0.5)]"
              />
            </div>

            <div className="min-w-0 flex-1 text-[13px] sm:text-[15px] text-white/80">
              <div className="flex items-center gap-2 py-2 border-b border-white/10 whitespace-nowrap">
                <span className="flex items-center justify-center w-5 h-5 rounded-md border-2 border-primary/80 shrink-0">
                  <Check size={11} strokeWidth={3} className="text-primary" />
                </span>
                +{experiences} experiencias
              </div>
              <div className="flex items-center gap-2 py-2 border-b border-white/10 whitespace-nowrap">
                <span className="flex items-center justify-center w-5 h-5 rounded-md border-2 border-accent-red/80 shrink-0">
                  <Check size={11} strokeWidth={3} className="text-accent-red" />
                </span>
                Quien recibe, elige 1 experiencia
              </div>
              <div className="flex items-center gap-2 py-2 border-b border-white/10 whitespace-nowrap">
                <span className="flex items-center justify-center w-5 h-5 rounded-md border-2 border-accent-green/80 shrink-0">
                  <Check size={11} strokeWidth={3} className="text-accent-green" />
                </span>
                6 meses para usarla
              </div>
              <div className="flex items-center gap-2 py-2 whitespace-nowrap">
                <span className="flex items-center justify-center w-5 h-5 rounded-md border-2 border-accent-blue/80 shrink-0">
                  <Check size={11} strokeWidth={3} className="text-accent-blue" />
                </span>
                Caja física incluida
              </div>
            </div>

          </div>

          {/* GIFT CONFIGURATION */}
          <p className="text-[13px] font-medium text-white/70 mb-2">
            ¿Cuántas Vivabox quieres regalar?
          </p>

          <div className="vb-dark vb-card flex items-center gap-4 px-4 py-3 mb-4">

            <div className="flex items-center gap-3">
              <button
                onClick={decrease}
                aria-label="Restar"
                className="vb-icon-btn w-8 h-8"
              >
                <Minus size={16} strokeWidth={2} />
              </button>

              <span className="text-[17px] font-semibold w-5 text-center">
                {quantity}
              </span>

              <button
                onClick={increase}
                aria-label="Sumar"
                className="vb-icon-btn w-8 h-8"
              >
                <Plus size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="w-px h-8 bg-white/15" />

            <div className="min-w-0">
              <p className="text-[17px] font-semibold leading-tight whitespace-nowrap">
                ${formatPrice(subtotal)} COP
              </p>
            </div>

          </div>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            className="vb-btn-primary w-full sm:w-auto h-14 px-12 text-[17px]"
          >
            Comprar ahora
          </button>

          <p className="flex items-center justify-center sm:justify-start gap-1.5 mt-3 text-[13px] text-white/60">
            <Lock size={12} strokeWidth={2} />
            Pago 100% seguro
          </p>

        </div>

      </div>

    </section>
  )
}
