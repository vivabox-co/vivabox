// Everything the preview needs to draw a company's Vivabox.
export type MaquetaConfig = {
  logoUrl: string | null
  message: string
  signature: string
  frontTextId: number
  frontCustom: string
  logoSize: number // 0 = S, 1 = M, 2 = L
  color: string // color of the "Elige tu experiencia" script
}
