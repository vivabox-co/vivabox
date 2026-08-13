"use client"

import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import { formatPrice } from "@/utils/formatPrice"
import BrandDots from "@/components/ui/BrandDots"

type Pricing = {
  subtotal: number
  delivery: number
  total: number
  discount?: number
}

type Props = {
  estimatedPricing: Pricing
}

export default function CheckoutSummary({ estimatedPricing }: Props) {

  const box = useCheckoutStore(s => s.box)
  const quantity = useCheckoutStore(s => s.quantity)
  const deliveryMethod = useCheckoutStore(s => s.deliveryMethod)
  const promoApplied = useCheckoutStore(s => s.promoApplied)
  const firstPurchaseApplied = useCheckoutStore(s => s.firstPurchaseApplied)
  const pricing = useCheckoutStore(s => s.pricing)
  const hasHydrated = useCheckoutStore(s => s.hasHydrated)

  // ======================
  // GUARD
  // ======================

  if (!hasHydrated || !box) {
    return (
      <div className="vb-card p-4">
        <p className="text-sm text-[#6B6B6B]">Cargando...</p>
      </div>
    )
  }

  // ======================
  // SOURCE OF TRUTH (HYBRID)
  // ======================

  const finalPricing = pricing ?? estimatedPricing
  const isEstimated = !pricing

  // Avant `start` : aperçu optimiste basé sur les indicateurs client (pas
  // encore validé serveur). Après `start` : la remise vient du backend
  // (pricing.discount), jamais devinée — total inclut déjà la remise.
  const hasBenefit = isEstimated
    ? (promoApplied || firstPurchaseApplied) && deliveryMethod === "domicilio"
    : (finalPricing.discount ?? 0) > 0

  const { subtotal, delivery, total } = finalPricing
  const discount = isEstimated ? (hasBenefit ? delivery : 0) : (finalPricing.discount ?? 0)
  const displayTotal = isEstimated ? total - discount : total

  return (
    <div className="vb-card p-4 sticky top-24 space-y-3">

      <div>
        <BrandDots />
        <h3 className="text-sm font-medium text-[#6B6B6B]">Resumen de compra</h3>
      </div>

      <div className="space-y-1.5 text-sm text-[#6B6B6B]/90">

        <div className="flex justify-between">
          <span>Vivabox</span>
          <span>${formatPrice(box.price)}</span>
        </div>

        <div className="flex justify-between">
          <span>Cantidad</span>
          <span>{quantity}</span>
        </div>

        <div className="flex justify-between">
          <span>Envío</span>
          <span>
            {delivery === 0
              ? "Gratis"
              : `+$${formatPrice(delivery)}`}
          </span>
        </div>

        {hasBenefit && (
          <div className="flex justify-between text-green-700">
            <span>Beneficio</span>
            <span>−${formatPrice(discount)}</span>
          </div>
        )}

      </div>

      <div className="vb-well px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">Total</span>
        <span className="text-2xl font-semibold text-ink tracking-tight">${formatPrice(displayTotal)}</span>
      </div>

    </div>
  )
}
