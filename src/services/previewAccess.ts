// Cookie qui contourne le garde-fou "checkout pas encore ouvert" en
// production (voir middleware.ts) — ce n'est pas une vraie limite de
// sécurité, seulement un accès anticipé caché derrière un clic invisible
// sur /proximamente (la lettre "o" de "Vivabox"). Valeur fixe volontaire :
// aucune donnée sensible n'est en jeu, seulement l'accès anticipé au
// checkout avant le lancement public.
export const PREVIEW_ACCESS_COOKIE = "vb_preview_access"
export const PREVIEW_ACCESS_VALUE = "a7f3c9e1-vivabox-early-access"
export const PREVIEW_ACCESS_MAX_AGE = 60 * 60 * 24 * 180 // 180 días
