import { MessageCircle, Mail } from "lucide-react"
import type { Lead } from "./types"
import { formatDate } from "../types"

// Heuristique simple : la plupart des saisies suivent le placeholder
// "+57 ..." et incluent déjà l'indicatif. Un numéro à 10 chiffres (mobile
// colombien standard sans indicatif) reçoit le préfixe 57 ; sinon on
// envoie tel quel plutôt que de deviner un mauvais indicatif.
function buildWhatsappLink(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, "")
  const withCountryCode = digits.length === 10 ? `57${digits}` : digits
  return `https://wa.me/${withCountryCode}`
}

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="vb-card p-5">
      <div className="mb-3.5">
        <div className="text-[19px] font-bold text-foreground leading-snug">
          {lead.experience_name}
        </div>
        <p className="text-muted text-sm mt-0.5">
          {lead.category} · {lead.location}
        </p>
      </div>

      {lead.experience_description && (
        <p className="my-1 text-[15px]">{lead.experience_description}</p>
      )}

      <p className="my-1 text-[15px] mt-2.5">
        <strong>{lead.name}</strong> · {lead.company}
      </p>

      {lead.website_or_instagram && (
        <p className="my-1 text-[15px] text-muted">{lead.website_or_instagram}</p>
      )}

      <p className="text-muted text-xs mt-2.5">
        Recibida el {formatDate(lead.created_at)} · Lead ID: {lead.id}
      </p>

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        {lead.whatsapp && (
          <a
            href={buildWhatsappLink(lead.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="vb-btn-dark h-11 px-5 text-sm inline-flex items-center gap-2"
          >
            <MessageCircle size={16} strokeWidth={2} />
            WhatsApp
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="vb-btn-soft h-11 px-5 text-sm inline-flex items-center gap-2"
          >
            <Mail size={16} strokeWidth={2} />
            Email
          </a>
        )}
      </div>
    </div>
  )
}
