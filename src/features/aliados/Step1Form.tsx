import { ArrowRight } from "lucide-react"
import type { AliadosFormData } from "./types"

type Errors = Partial<Record<"name" | "company" | "whatsapp" | "email", string>>

type Props = {
  values: AliadosFormData
  errors: Errors
  onChange: <K extends keyof AliadosFormData>(field: K, value: AliadosFormData[K]) => void
  onSubmit: () => void
}

export default function Step1Form({ values, errors, onChange, onSubmit }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        01 / 02
      </p>

      <h1 className="mt-4 text-[24px] md:text-[28px] font-bold text-ink leading-[1.2] tracking-tight">
        ¿Tienes una experiencia que vale la pena regalar?
      </h1>

      <p className="mt-3 text-muted text-[15px] leading-relaxed">
        En Vivabox conectamos personas con experiencias que vale la pena vivir
        y regalar. Si tienes una experiencia que podría hacer parte de
        nuestra selección, queremos conocerla.
      </p>

      <p className="mt-2 text-ink/80 text-sm font-medium">
        Haz que más personas descubran tu experiencia.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        noValidate
      >
        <div>
          <label htmlFor="aliados-name" className="block text-xs font-medium text-muted mb-1.5">
            Nombre
          </label>
          <input
            id="aliados-name"
            type="text"
            placeholder="Tu nombre"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="vb-input"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "aliados-name-error" : undefined}
          />
          {errors.name && (
            <p id="aliados-name-error" role="alert" className="text-xs text-accent-red mt-1.5">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="aliados-company" className="block text-xs font-medium text-muted mb-1.5">
            Empresa / marca
          </label>
          <input
            id="aliados-company"
            type="text"
            placeholder="Nombre de tu empresa o marca"
            value={values.company}
            onChange={(e) => onChange("company", e.target.value)}
            className="vb-input"
            aria-invalid={!!errors.company}
            aria-describedby={errors.company ? "aliados-company-error" : undefined}
          />
          {errors.company && (
            <p id="aliados-company-error" role="alert" className="text-xs text-accent-red mt-1.5">
              {errors.company}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="aliados-whatsapp" className="block text-xs font-medium text-muted mb-1.5">
            WhatsApp
          </label>
          <input
            id="aliados-whatsapp"
            type="tel"
            placeholder="+57 ..."
            value={values.whatsapp}
            onChange={(e) => onChange("whatsapp", e.target.value)}
            className="vb-input"
            aria-invalid={!!errors.whatsapp}
            aria-describedby={errors.whatsapp ? "aliados-whatsapp-error" : undefined}
          />
          {errors.whatsapp && (
            <p id="aliados-whatsapp-error" role="alert" className="text-xs text-accent-red mt-1.5">
              {errors.whatsapp}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="aliados-email" className="block text-xs font-medium text-muted mb-1.5">
            Email
          </label>
          <input
            id="aliados-email"
            type="email"
            placeholder="tu@email.com"
            value={values.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="vb-input"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "aliados-email-error" : undefined}
          />
          {errors.email && (
            <p id="aliados-email-error" role="alert" className="text-xs text-accent-red mt-1.5">
              {errors.email}
            </p>
          )}
        </div>

        <button type="submit" className="vb-btn-primary w-full h-[54px] text-[16px] mt-2">
          Contarnos sobre tu experiencia
          <ArrowRight size={18} strokeWidth={2} className="vb-cta-icon" />
        </button>
      </form>
    </div>
  )
}
