// Types et helpers partagés par les deux zones (pedidos/ et reservas/) —
// seul fichier de ce dossier qu'un Client Component peut importer sans
// entraîner tout le code Supabase/Server Actions dans le bundle client.

export const PAGE_PATH = "/pedidos-r6ryavbmwd4qw5"
export const HISTORY_LIMIT = 50

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
}
