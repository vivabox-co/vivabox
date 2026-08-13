"use client"

import { useEffect } from "react"
import Image from "next/image"
import { formatPrice } from "@/utils/formatPrice"
import { Check, Minus, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"

type BoxHeroProps = {
  name: string
  price: number
  experiences: number
  image: string
  slug: string
}

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

  const increase = () => setQuantity(Math.min(10, quantity + 1))
  const decrease = () => setQuantity(Math.max(1, quantity - 1))

  const subtotal = price * quantity

  const handleCheckout = () => {
    router.push(`/checkout/${slug}`)
  }

  return (
    <section id="box-hero" className="relative overflow-hidden pt-20 md:pt-24 pb-6 md:pb-8">

      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero/hero.png"
          alt="Experiencias Vivabox"
          fill
          priority
          sizes="100vw"
          className="object-cover blur-[5px] brightness-[0.8] scale-110"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-[720px] mx-auto px-6">

        {/* TEXT */}
        <div className="text-white">

          <h1 className="h1 mb-3 max-w-[440px]">
            Tu regalo ya casi está listo.
          </h1>

          <p className="text-[22px] sm:text-[26px] font-semibold mb-6">
            ${formatPrice(price)} COP
          </p>

          {/* BOX + CHECKLIST */}
          <div className="flex items-center gap-6 sm:gap-10 mb-8">

            <div className="shrink-0 w-[190px] sm:w-[260px] md:w-[320px]">
              <Image
                src={image}
                alt={name}
                width={320}
                height={320}
                className="w-full h-auto object-contain drop-shadow-[0_40px_50px_rgba(0,0,0,0.5)] scale-125"
              />
            </div>

            <div className="space-y-2.5 text-[14px] sm:text-[15px] text-white/80">
              <div className="flex items-center gap-2">
                <Check size={18} strokeWidth={1.5} className="text-primary-hover shrink-0" />
                Más de {experiences} experiencias
              </div>
              <div className="flex items-center gap-2">
                <Check size={18} strokeWidth={1.5} className="text-primary-hover shrink-0" />
                La persona elige la experiencia
              </div>
              <div className="flex items-center gap-2">
                <Check size={18} strokeWidth={1.5} className="text-primary-hover shrink-0" />
                Vigencia 6 meses
              </div>
              <div className="flex items-center gap-2">
                <Check size={18} strokeWidth={1.5} className="text-primary-hover shrink-0" />
                Caja física incluida
              </div>
            </div>

          </div>

          {/* GIFT CONFIGURATION */}
          <p className="text-[13px] font-medium text-white/70 mb-2">
            ¿Cuántas Vivabox quieres regalar?
          </p>

          <div className="vb-dark vb-card flex items-center gap-4 px-5 py-3.5 mb-6">

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

          <p className="text-center sm:text-left mt-4 text-[13px] text-white/60">
            Pago 100% seguro
          </p>

        </div>

      </div>

    </section>
  )
}
