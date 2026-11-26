// Chemins « piège » : n'existent pas sur Vivabox, mais les bots les testent en
// permanence (WordPress, phpMyAdmin, fichiers .env, dépôt .git...). Toute
// requête vers l'un d'eux déclenche une alerte (voir proxy.ts et
// api/security/trap).
//
// ⚠️ Ne jamais créer de vraie page ou route sous ces noms : elle serait
// interceptée. Si le matcher du proxy est modifié, garder cette liste et
// le matcher synchronisés.
const TRAP_SEGMENTS = new Set([
  "wp-admin",
  "wp-login.php",
  "wp-content",
  "wp-includes",
  "xmlrpc.php",
  "phpmyadmin",
  "pma",
  "admin",
  "administrator",
  "cpanel",
  ".git",
  ".aws",
  ".ssh",
])

export function isTrapPath(pathname: string): boolean {
  const [first = "", second = ""] = pathname.toLowerCase().split("/").filter(Boolean)

  if (TRAP_SEGMENTS.has(first)) return true
  // .env, .env.local, .env.production, .env.backup...
  if (first.startsWith(".env")) return true
  if (first === "api" && second === "admin") return true

  return false
}
