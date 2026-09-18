// Code "prix test" : fait payer un montant symbolique (1 000 COP par défaut)
// au lieu du prix de la box, pour tester le vrai parcours d'achat en
// production avec un vrai virement.
//
// Le code n'existe que dans la variable d'environnement CHECKOUT_TEST_CODE
// (secret, jamais en base ni dans le code) : le retirer de Vercel le
// désactive immédiatement. Le montant vient de CHECKOUT_TEST_TOTAL.
//
// La venta est marquée promo_code_input = TEST_PROMO_MARKER : c'est ce qui
// permet de la retrouver pour la compta et d'afficher « PRUEBA » dans le
// back-office (vivabox-operativo, Pedidos → Pagos).

export const TEST_PROMO_MARKER = "PRUEBA"

const DEFAULT_TEST_TOTAL = 1000

export function isTestPriceCode(rawCode: string): boolean {
  const secret = process.env.CHECKOUT_TEST_CODE?.trim().toUpperCase()
  if (!secret) return false
  return rawCode.trim().toUpperCase() === secret
}

export function getTestTotal(): number {
  const parsed = parseInt(process.env.CHECKOUT_TEST_TOTAL ?? "", 10)
  return Number.isFinite(parsed) && parsed >= 1000 ? parsed : DEFAULT_TEST_TOTAL
}
