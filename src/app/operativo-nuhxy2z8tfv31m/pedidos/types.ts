// Types purs de la zone Pedidos — voir la note dans ../types.ts sur la
// séparation Client/Server Component.

export type Order = {
  id: string
  created_at: string
  box_slug: string
  quantity: number
  buyer_name: string
  buyer_email: string
  recipient_name: string | null
  recipient_contact: string | null
  delivery_direccion: string | null
  delivery_ciudad: string | null
  delivery_detalles: string | null
  prepared_at: string | null
  shipped_at: string | null
  code: string | null
  code_status: "unused" | "activated" | "expired" | null
}
