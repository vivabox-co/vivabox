"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/utils/formatPrice"
import { useCheckoutStore } from "@/features/checkout/checkoutStore"

type Props = {
  price: number
  slug: string
}

// Lifts the floating WhatsApp button above the bar while it's on screen —
// WhatsappButton reads this var and falls back to 0 on every other page.
const WHATSAPP_OFFSET = "76px"

export default function BoxStickyCTA({ price, slug }: Props) {

  const router = useRouter()

  const quantity = useCheckoutStore((s) => s.quantity)
  const hasHydrated = useCheckoutStore((s) => s.hasHydrated)

  // Only once the hero's own CTA has scrolled out of view — showing both at
  // the same time would just duplicate the button.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById("box-hero")
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" }
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sticky-cta-offset",
      visible ? WHATSAPP_OFFSET : "0px"
    )
    return () => document.documentElement.style.setProperty("--sticky-cta-offset", "0px")
  }, [visible])

  const subtotal = price * (hasHydrated ? quantity : 1)

  return (
    <div
      className={`vb-sticky-bar lg:hidden fixed bottom-0 inset-x-0 z-40 px-4 pt-3 transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3">

        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted leading-tight">
            {quantity > 1 ? `${quantity} Vivabox` : "Vivabox"}
          </p>
          <p className="font-semibold text-ink leading-tight truncate">
            ${formatPrice(subtotal)} COP
          </p>
        </div>

        <button
          onClick={() => router.push(`/checkout/${slug}`)}
          tabIndex={visible ? 0 : -1}
          className="vb-btn-primary h-12 px-8 shrink-0"
        >
          Comprar ahora
        </button>

      </div>
    </div>
  )
}
