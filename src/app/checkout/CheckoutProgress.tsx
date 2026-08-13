"use client"

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
}

export default function CheckoutProgress({ current, completed = false }: Props) {

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

          return (
            <div
              key={step.key}
              role="listitem"
              className={`vb-step ${state === "active" ? "is-active" : ""} ${state === "done" ? "is-done" : ""}`}
            >
              <span className="vb-step-dot">
                {state === "done" ? <Check className="w-3 h-3" strokeWidth={2} /> : index + 1}
              </span>
              {step.label}
            </div>
          )
        })}

      </div>
    </div>
  )
}

