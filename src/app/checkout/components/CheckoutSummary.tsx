"use client"

import { useCheckoutStore } from "@/features/checkout/checkoutStore"
import { useDisplayPricing, type EstimatedPricing } from "@/features/checkout/useDisplayPricing"
import { formatPrice } from "@/utils/formatPrice"
import BrandDots from "@/components/ui/BrandDots"

type Props = {
  estimatedPricing: EstimatedPricing
}

export default function CheckoutSummary({ estimatedPricing }: Props) {

  const box = useCheckoutStore(s => s.box)
  const quantity = useCheckoutStore(s => s.quantity)
  const hasHydrated = useCheckoutStore(s => s.hasHydrated)
  const { delivery, discount, displayTotal, hasBenefit } = useDisplayPricing(estimatedPricing)

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

  return (
    <div className="vb-card p-4 space-y-3">

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
