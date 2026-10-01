import type { SupabaseClient } from "@supabase/supabase-js"
import { boxes } from "@/data/boxes"
import { escapeHtml, getResend } from "@/services/email"
import { whatsappLink } from "@/utils/whatsappLink"
import { SAME_DAY_SPEED, SAME_DAY_PROMISE, sameDayOutcome } from "@/features/checkout/sameDay"

// Emails transactionnels envoyés à l'ACHETEUR (ceux de services/email.ts vont
// à l'équipe). Deux moments du parcours :
//   paid     — paiement confirmé (webhook/verify Wompi)
//   shipped  — box remise au transportista (back-office)
//
// Envoyés depuis le sous-domaine vérifié dans Resend : le domaine racine
// vivabox.com.co ne l'est pas (403 "domain is not verified"), et contact@ reste
// sur Google Workspace, d'où le Reply-To.
const FROM = process.env.BUYER_EMAIL_FROM || "Vivabox <notificaciones@notify.vivabox.com.co>"
const REPLY_TO = "contact@vivabox.com.co"

// Les clients mail ne lisent ni le SVG ni (partout) le webp : le logo est un PNG
// servi par le site (public/images/email/), en 2x pour les écrans retina. URL
// absolue obligatoire — l'image doit être déployée pour s'afficher.
//
// Le logo est noir : posé à nu sur la carte, il disparaît quand Gmail passe
// l'email en mode sombre (il inverse les fonds mais jamais les images). D'où
// la pastille crème (#FFFCF9, comme la carte) cuite dans le PNG : invisible en
// mode clair, elle garde le logo lisible en mode sombre. Le PNG contient le
// logo complet (icône cadeau + "v!vabox"), 438px de large = 219px affichés.
// Changer le nom du fichier si l'image change — Gmail met les images en cache
// par URL.
const LOGO_URL = "https://www.vivabox.com.co/images/email/vivabox-logo-full.png"

export type BuyerEmailKind = "paid" | "shipped"

type Venta = {
  id: string
  status: string
  box_slug: string
  quantity: number
  buyer_name: string
  buyer_email: string
  total: number
  delivery_type: string
  recipient_name: string | null
  delivery_ciudad: string | null
  shipped_at: string | null
  delivery_speed: string | null
  paid_at: string | null
}

type Content = {
  subject: string
  title: string
  paragraphs: string[]
  rows: [label: string, value: string][]
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || ""
}

function summaryRows(venta: Venta): Content["rows"] {
  const box = boxes.find(b => b.slug === venta.box_slug)

  return [
    ["Tu regalo", `${box?.name ?? "Vivabox"} × ${venta.quantity}`],
    ["Total", `$${venta.total.toLocaleString("es-CO")} COP`],
  ]
}

function buildContent(kind: BuyerEmailKind, venta: Venta): Content {
  const isPhysical = venta.delivery_type === "physical"
  const city = venta.delivery_ciudad?.trim()
  const recipient = venta.recipient_name?.trim()
  const isGift = !!recipient && recipient !== venta.buyer_name.trim()

  if (kind === "paid") {
    const sameDay = venta.delivery_speed === SAME_DAY_SPEED && venta.paid_at
    const outcome = sameDay ? sameDayOutcome(new Date(venta.paid_at!)) : null

    // Solo prometemos "hoy" si el pago entró a tiempo; si no, el equipo decide
    // y escribe al cliente.
    const sameDayParagraph =
      outcome === "missed"
        ? "Tu pago llegó después de la hora límite del envío el mismo día. Te escribimos enseguida para confirmarte la entrega."
        : outcome
          ? `Elegiste envío el mismo día: ${SAME_DAY_PROMISE.charAt(0).toLowerCase()}${SAME_DAY_PROMISE.slice(1)}`
          : null

    return {
      subject: "Pago confirmado — gracias por regalar una Vivabox",
      title: "¡Pago confirmado!",
      paragraphs: [
        "Tu compra quedó confirmada. Gracias por elegir Vivabox para regalar.",
        isPhysical
          ? `Ahora preparamos tu Vivabox con cuidado y te escribimos por aquí cuando salga${city ? ` hacia ${city}` : ""}. Nosotros coordinamos todo.`
          : "Tu Vivabox digital quedó registrada. Nosotros coordinamos todo.",
        ...(sameDayParagraph ? [sameDayParagraph] : []),
      ],
      rows: summaryRows(venta),
    }
  }

  return {
    subject: "Tu Vivabox ya salió",
    title: "Tu Vivabox va en camino",
    paragraphs: [
      `${isGift ? `El regalo para ${recipient}` : "Tu Vivabox"} ya salió de nuestras manos${city ? ` hacia ${city}` : ""}.`,
      "Si tienes cualquier duda con la entrega, respóndenos a este correo o escríbenos por WhatsApp.",
    ],
    rows: summaryRows(venta),
  }
}

function renderHtml(greeting: string, content: Content) {
  const paragraphs = content.paragraphs
    .map(p => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1C1C1C">${escapeHtml(p)}</p>`)
    .join("")

  const rows = content.rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6B6B6B">${escapeHtml(label)}</td>
        <td style="padding:6px 0;font-size:14px;color:#18140F;text-align:right"><strong>${escapeHtml(value)}</strong></td>
      </tr>`)
    .join("")

  const help = whatsappLink("Hola, tengo una pregunta sobre mi pedido de Vivabox.")

  return `
    <div style="background:#FAF7F2;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
      <div style="max-width:520px;margin:0 auto;background:#FFFCF9;border-radius:20px;padding:32px 28px">
        <img src="${LOGO_URL}" alt="Vivabox" width="219" style="display:block;border:0;width:219px;max-width:100%;height:auto;margin:0 0 20px -13px;font-size:20px;font-weight:700;color:#FF8406">
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#18140F">${escapeHtml(content.title)}</h1>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1C1C1C">${escapeHtml(greeting)}</p>
        ${paragraphs}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;padding:8px 16px;background:#FFF4EC;border-radius:14px">${rows}</table>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6B6B6B">
          ¿Dudas? Responde este correo o <a href="${help}" style="color:#E67705">escríbenos por WhatsApp</a>.
        </p>
      </div>
    </div>
  `
}

function renderText(greeting: string, content: Content) {
  return [
    content.title,
    "",
    greeting,
    "",
    ...content.paragraphs.flatMap(p => [p, ""]),
    ...content.rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "¿Dudas? Responde este correo o escríbenos por WhatsApp.",
  ].join("\n")
}

// El estado real de la venta manda: un correo "pago confirmado" nunca sale
// para una venta que no está pagada, aunque quien llame se equivoque.
function matchesKind(kind: BuyerEmailKind, venta: Venta) {
  if (kind === "paid") return venta.status === "paid" || venta.status === "completed"
  return venta.shipped_at !== null
}

// Best-effort, como los demás emails: nunca debe bloquear ni hacer fallar el
// checkout o el back-office. Devuelve si el correo salió.
//
// Sin columna de "ya enviado": Resend ignora un segundo envío con la misma
// clave de idempotencia durante 24 h (webhook Wompi + /verify pueden llegar a
// la vez), y las transiciones que disparan "paid"/"shipped" ya son atómicas
// (WHERE status IN (...) / shipped_at IS NULL), así que sólo salen una vez.
export async function sendBuyerEmail(
  supabase: SupabaseClient,
  ventaId: string,
  kind: BuyerEmailKind
): Promise<boolean> {
  try {
    const { data: venta, error } = await supabase
      .from("ventas")
      .select("id, status, box_slug, quantity, buyer_name, buyer_email, total, delivery_type, recipient_name, delivery_ciudad, shipped_at, delivery_speed, paid_at")
      .eq("id", ventaId)
      .maybeSingle<Venta>()

    if (error || !venta) {
      console.error("BUYER EMAIL LOOKUP ERROR:", error ?? `venta ${ventaId} not found`)
      return false
    }

    if (!matchesKind(kind, venta)) {
      console.warn(`BUYER EMAIL SKIPPED: venta=${ventaId} kind=${kind} status=${venta.status}`)
      return false
    }

    const to = venta.buyer_email.trim()

    if (!EMAIL_RE.test(to)) {
      console.warn(`BUYER EMAIL SKIPPED: invalid buyer_email on venta=${ventaId}`)
      return false
    }

    const content = buildContent(kind, venta)
    const name = firstName(venta.buyer_name)
    const greeting = name ? `Hola ${name},` : "Hola,"

    const { error: sendError } = await getResend().emails.send(
      {
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: content.subject,
        html: renderHtml(greeting, content),
        text: renderText(greeting, content),
      },
      { idempotencyKey: `buyer-${kind}-${ventaId}` }
    )

    if (sendError) {
      console.error("BUYER EMAIL SEND ERROR:", sendError)
      return false
    }

    return true
  } catch (error) {
    console.error("BUYER EMAIL ERROR:", error)
    return false
  }
}
