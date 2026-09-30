"use client"

import Link from "next/link"
import { Check } from "lucide-react"

type Step = "elegir" | "pagar" | "enviar"

const steps: { key: Step; label: string }[] = [
  { key: "elegir", label: "Elegir" },
  { key: "pagar", label: "Pagar" },
  { key: "enviar", label: "Enviar" },
]

type Props = {
  current: Step
  // Marca el paso actual como completado (check) en vez de "activo" —
  // se usa en "enviar" una vez guardado el mensaje, para que los 3 pasos
  // muestren el mismo check de validación.
  completed?: boolean
  // Destino opcional para volver a una etapa ya hecha: solo se aplica a las
  // etapas en estado "done" (nunca a la actual ni a las futuras).
  hrefs?: Partial<Record<Step, string>>
}

export default function CheckoutProgress({ current, completed = false, hrefs }: Props) {

  const order: Step[] = ["elegir", "pagar", "enviar"]

  return (
    <div className="checkout-container pt-4">
      <div className="vb-steps max-w-[1100px] mx-auto" role="list" aria-label="Progreso de la compra">

        {steps.map((step, index) => {

          const currentIndex = order.indexOf(current)
          const stepIndex = order.indexOf(step.key)

          const state =
            stepIndex < currentIndex
              ? "done"
              : stepIndex === currentIndex
              ? (completed ? "done" : "active")
              : "pending"

          const href = state === "done" ? hrefs?.[step.key] : undefined
          const className = `vb-step ${state === "active" ? "is-active" : ""} ${state === "done" ? "is-done" : ""} ${href ? "is-link" : ""}`
          const content = (
            <>
              <span className="vb-step-dot">
                {state === "done" ? <Check className="w-3 h-3" strokeWidth={2} /> : index + 1}
              </span>
              {step.label}
            </>
          )

          return href ? (
            <Link key={step.key} href={href} role="listitem" className={className}>
              {content}
            </Link>
          ) : (
            <div key={step.key} role="listitem" className={className}>
              {content}
            </div>
          )
        })}

      </div>
    </div>
  )
}

