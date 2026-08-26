import { ArrowLeft, ArrowRight, ChevronDown, Loader2 } from "lucide-react"
import { EXPERIENCE_CATEGORIES } from "./validation"
import type { AliadosFormData } from "./types"

type Errors = Partial<Record<"category" | "experienceName" | "experienceDescription", string>>

type Props = {
  values: AliadosFormData
  errors: Errors
  onChange: <K extends keyof AliadosFormData>(field: K, value: AliadosFormData[K]) => void
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  submitError: string
}

export default function Step2Form({
  values,
  errors,
  onChange,
  onBack,
  onSubmit,
  submitting,
  submitError,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          02 / 02
        </p>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Atrás
        </button>
      </div>

      <h2 className="mt-4 text-[24px] md:text-[28px] font-bold text-ink leading-[1.2] tracking-tight">
        Ahora queremos conocer tu experiencia
      </h2>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        noValidate
      >
        <div>
          <label htmlFor="aliados-category" className="block text-xs font-medium text-muted mb-1.5">
            ¿Qué tipo de experiencia ofreces?
          </label>
          <div className="relative">
            <select
              id="aliados-category"
              value={values.category}
              onChange={(e) => onChange("category", e.target.value)}
              className="vb-input appearance-none pr-10"
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? "aliados-category-error" : undefined}
            >
              <option value="" disabled>
                Elige una categoría
              </option>
              {EXPERIENCE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              strokeWidth={2}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
          {errors.category && (
            <p id="aliados-category-error" role="alert" className="text-xs text-accent-red mt-1.5">
              {errors.category}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="aliados-experience-name" className="block text-xs font-medium text-muted mb-1.5">
            ¿Cómo se llama tu experiencia?
          </label>
          <input
            id="aliados-experience-name"
            type="text"
            placeholder="Ej. Cena de autor con vista a la ciudad"
            value={values.experienceName}
            onChange={(e) => onChange("experienceName", e.target.value)}
            className="vb-input"
            aria-invalid={!!errors.experienceName}
            aria-describedby={errors.experienceName ? "aliados-experience-name-error" : undefined}
          />
          {errors.experienceName && (
            <p id="aliados-experience-name-error" role="alert" className="text-xs text-accent-red mt-1.5">
              {errors.experienceName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="aliados-experience-description" className="block text-xs font-medium text-muted mb-1.5">
            ¿Qué vive una persona cuando la disfruta?
          </label>
          <textarea
            id="aliados-experience-description"
            placeholder="Cuéntanos brevemente qué hace especial esta experiencia."
            value={values.experienceDescription}
            onChange={(e) => onChange("experienceDescription", e.target.value)}
            className="vb-input resize-none"
            rows={3}
            aria-invalid={!!errors.experienceDescription}
            aria-describedby={errors.experienceDescription ? "aliados-experience-description-error" : undefined}
          />
          {errors.experienceDescription && (
            <p id="aliados-experience-description-error" role="alert" className="text-xs text-accent-red mt-1.5">
              {errors.experienceDescription}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="aliados-website" className="block text-xs font-medium text-muted mb-1.5">
            Instagram / página web <span className="font-normal text-muted/70">(opcional)</span>
          </label>
          <input
            id="aliados-website"
            type="text"
            placeholder="@... o www..."
            value={values.websiteOrInstagram}
            onChange={(e) => onChange("websiteOrInstagram", e.target.value)}
            className="vb-input"
          />
        </div>

        {submitError && (
          <p role="alert" className="text-xs text-accent-red">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="vb-btn-primary w-full h-[54px] text-[16px] mt-2"
        >
          {submitting ? (
            <>
              Enviando…
              <Loader2 size={18} strokeWidth={2} className="animate-spin" />
            </>
          ) : (
            <>
              Proponer mi experiencia
              <ArrowRight size={18} strokeWidth={2} className="vb-cta-icon" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
