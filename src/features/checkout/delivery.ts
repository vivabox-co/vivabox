// Prix de l'envoi à domicile, en COP. 0 = envoi inclus dans le prix de la box.
export const DELIVERY_PRICE_COP = 0

// Nombre de cajas à partir duquel l'envoi est offert. Sans effet tant que
// DELIVERY_PRICE_COP vaut 0. Prêt pour la campagne de Noël.
export const FREE_DELIVERY_FROM_QUANTITY = 2

// Source de vérité unique du prix d'envoi : client (affichage) et serveur
// (api/checkout/start) l'importent.
export function deliveryPriceFor(quantity: number): number {
  if (DELIVERY_PRICE_COP === 0) return 0
  return quantity >= FREE_DELIVERY_FROM_QUANTITY ? 0 : DELIVERY_PRICE_COP
}
