export const MESSAGE_MAX_LENGTH = 200
export const SIGNATURE_MAX_LENGTH = 30

// Le coeur optionnel est stocké dans la signature elle-même (message_de), pour
// ne pas ajouter de colonne : "Camilo ♡".
export const HEART = "♡"

// Le champ message n'a pas de maxLength natif : un collage trop long serait
// coupé en silence. On laisse dépasser, on surligne l'excédent et on bloque
// l'enregistrement tant que le message ne rentre pas.
export function messageOverflow(mensaje: string): number {
  return Math.max(0, mensaje.length - MESSAGE_MAX_LENGTH)
}
