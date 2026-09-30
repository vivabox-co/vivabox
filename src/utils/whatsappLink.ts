const VIVABOX_WHATSAPP = "573142590291"

export function whatsappLink(message: string): string {
  return `https://wa.me/${VIVABOX_WHATSAPP}?text=${encodeURIComponent(message)}`
}
