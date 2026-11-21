// Sérialise des données structurées (JSON-LD) pour un <script> inline.
// JSON.stringify n'échappe pas "<" : un texte venu du Google Sheet contenant
// "</script>" fermerait la balise et permettrait d'injecter du HTML/JS.
// On remplace "<" par sa forme échappée JSON (backslash-u-003c), lue à
// l'identique par les moteurs de recherche ; idem pour les séparateurs de
// ligne U+2028/U+2029, invalides dans certains parseurs JavaScript.
const ESCAPES: Record<string, string> = {
  "<": "\\" + "u003c",
  [String.fromCharCode(0x2028)]: "\\" + "u2028",
  [String.fromCharCode(0x2029)]: "\\" + "u2029",
}

const ESCAPE_RE = new RegExp(`[${Object.keys(ESCAPES).join("")}]`, "g")

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(ESCAPE_RE, (ch) => ESCAPES[ch])
}
