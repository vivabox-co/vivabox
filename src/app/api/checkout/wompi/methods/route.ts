import { NextResponse } from "next/server"
import { fetchWompiAcceptedPaymentMethods, getWompiPublicKey } from "@/services/wompi"

// Expone al frontend qué métodos de pago están realmente habilitados en
// nuestro comercio Wompi, para no hardcodear ni inventar una lista en el UI.
// `methods: []` cuando Wompi no responde — el frontend decide su propio
// fallback visual, esta ruta no lo hace por él.
export async function GET() {
  const methods = await fetchWompiAcceptedPaymentMethods(getWompiPublicKey())
  return NextResponse.json({ ok: true, methods: methods ?? [] })
}
