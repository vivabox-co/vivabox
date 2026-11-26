// Codes « appât » (honeypot) : des noms tentants qu'aucun vrai client ne
// connaît ni ne tape. Si quelqu'un les essaie au checkout, c'est quelqu'un
// qui devine ou qui fouille — on déclenche une alerte (voir securityAlert.ts).
//
// ⚠️ Ces noms ne doivent JAMAIS être créés comme vrais codes promo : un vrai
// client qui taperait le sien déclencherait une fausse alerte. Ils ne sont
// volontairement pas dans la table promo_codes.
const BAIT_CODES = new Set([
  "ADMIN",
  "STAFF",
  "VIVABOX100",
  "TEST100",
  "GRATIS",
  "GRATIS100",
  "FREE",
  "FREE100",
  "100OFF",
  "EQUIPO",
])

export function isBaitCode(rawCode: string): boolean {
  return BAIT_CODES.has(rawCode.trim().toUpperCase())
}
