// Paiement manuel par Bre-B / QR Bancolombia (virement instantané), proposé
// à côté de Wompi. Aucune importation serveur ici : ce
// fichier est partagé entre composants client et routes API.
//

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
