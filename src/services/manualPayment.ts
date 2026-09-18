// Paiement manuel par Bre-B (virement instantané) — solution transitoire
// tant que Wompi n'est pas activé. Aucune importation serveur ici : ce
// fichier est partagé entre composants client et routes API.
//
// Retour à Wompi : mettre NEXT_PUBLIC_PAYMENT_PROVIDER=wompi sur Vercel
// (puis redeploy). Sans cette variable, le checkout utilise le paiement
// manuel.

export const PAYMENT_PROVIDER: "wompi" | "manual" =
  process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === "wompi" ? "wompi" : "manual"

// Informations publiques d'encaissement (la llave est faite pour être
// partagée). `holder` reprend exactement le nom que la banque affiche à
// l'acheteur avant qu'il confirme le virement.
export const MANUAL_PAYMENT = {
  network: "Bre-B",
  bank: "Bancolombia",
  llave: "0092738144",
  holder: "Vivabox Colombia Sas",
  whatsappNumber: "573142590291",
} as const

// Référence courte à écrire dans le message du virement, dérivée de l'id de
// la venta. Le back-office retrouve la venta par cette même référence (voir
// vivabox-operativo, pedidos/por-verificar).
export function paymentReference(ventaId: string): string {
  return `VB-${ventaId.replace(/-/g, "").slice(0, 6).toUpperCase()}`
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${MANUAL_PAYMENT.whatsappNumber}?text=${encodeURIComponent(message)}`
}
