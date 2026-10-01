import { useCheckoutStore } from "@/features/checkout/checkoutStore"

export type EstimatedPricing = {
  subtotal: number
  delivery: number
  total: number
  discount?: number
}

/**
 * Single source of truth for the amounts shown in the checkout UI
 * (summary card + sticky bottom bar).
 *
 * Before `start`: optimistic preview based on client flags (not yet validated
 * server-side). After `start`: the discount comes from the backend
 * (pricing.discount), never guessed — its total already includes the discount.
 */
export function useDisplayPricing(estimatedPricing: EstimatedPricing) {
  const pricing = useCheckoutStore(s => s.pricing)

  const finalPricing = pricing ?? estimatedPricing
  const isEstimated = !pricing

  const { subtotal, delivery, total } = finalPricing
  // Avant `start`, le bénéfice d'un code est calculé par l'appelant (prix
  // d'envoi de base, jamais le supplément « mismo día ») ; après, il vient du serveur.
  const discount = finalPricing.discount ?? 0
  const hasBenefit = discount > 0
  const displayTotal = isEstimated ? total - discount : total

  return { subtotal, delivery, discount, displayTotal, hasBenefit }
}
