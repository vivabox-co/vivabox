import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function SuccessState() {
  return (
    <div className="text-center py-4 animate-step">
      <div className="mx-auto flex items-center justify-center gap-3">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80">
          Propuesta recibida
        </span>
      </div>

      <h2 className="mt-6 text-[24px] md:text-[28px] font-bold text-ink leading-[1.2] tracking-tight">
        ¡Recibimos tu propuesta!
      </h2>

      <p className="mt-4 text-muted text-[15px] leading-relaxed">
        Gracias por querer hacer parte de Vivabox. Revisaremos tu experiencia
        y te contactaremos si vemos una oportunidad de trabajar juntos.
      </p>

      <Link
        href="/nuestra-historia"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition"
      >
        Conoce más sobre Vivabox
        <ArrowRight size={16} strokeWidth={2} />
      </Link>
    </div>
  )
}
