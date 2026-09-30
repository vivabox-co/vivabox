import crypto from "crypto"

// L'environnement (sandbox vs production) est déduit du préfixe de la clé
// publique plutôt que d'une variable séparée, pour ne jamais pouvoir
// désynchroniser les deux (docs Wompi : pub_test_ / pub_prod_).
function getWompiApiBase(publicKey: string): string {
  return publicKey.startsWith("pub_prod_")
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1"
}

export function getWompiPublicKey(): string {
  const key = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY
  if (!key) throw new Error("NEXT_PUBLIC_WOMPI_PUBLIC_KEY no configurada")
  return key
}

// Firma de integridad del Widget Checkout — sha256(reference + amountInCents + currency + secret).
// https://docs.wompi.co/docs/colombia/widget-checkout-web/
export function computeIntegritySignature(params: {
  reference: string
  amountInCents: number
  currency: string
}): string {
  const secret = process.env.WOMPI_INTEGRITY_SECRET
  if (!secret) throw new Error("WOMPI_INTEGRITY_SECRET no configurada")

  const raw = `${params.reference}${params.amountInCents}${params.currency}${secret}`
  return crypto.createHash("sha256").update(raw).digest("hex")
}

// Checksum de un evento (webhook) Wompi — sha256 de la concaténation, dans
// l'ordre, des valeurs pointées par signature.properties + timestamp + secret.
// https://docs.wompi.co/docs/colombia/eventos/
export function computeEventChecksum(params: {
  properties: string[]
  data: Record<string, unknown>
  timestamp: number
}): string {
  const secret = process.env.WOMPI_EVENTS_SECRET
  if (!secret) throw new Error("WOMPI_EVENTS_SECRET no configurada")

  const values = params.properties.map((path) => {
    const value = path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object" && key in acc) {
        return (acc as Record<string, unknown>)[key]
      }
      return undefined
    }, params.data)

    return value === undefined || value === null ? "" : String(value)
  })

  const raw = `${values.join("")}${params.timestamp}${secret}`
  return crypto.createHash("sha256").update(raw).digest("hex")
}

export type WompiTransaction = {
  id: string
  reference: string
  status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING"
  amount_in_cents: number
  currency: string
}

// Lectura pública — no requiere autenticación (el id de transacción es un
// UUID no adivinable). https://docs.wompi.co/docs/colombia/transacciones/
export async function fetchWompiTransaction(
  transactionId: string,
  publicKey: string
): Promise<WompiTransaction | null> {
  const base = getWompiApiBase(publicKey)

  const res = await fetch(`${base}/transactions/${encodeURIComponent(transactionId)}`, {
    headers: { Authorization: `Bearer ${publicKey}` },
    cache: "no-store",
  })

  if (!res.ok) return null

  const body = await res.json()
  return body?.data ?? null
}
