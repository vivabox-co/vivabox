"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

type Props = {
  validityMonths: number
}

export default function BoxFAQ({ validityMonths }: Props) {

  const faqs = [
    {
      question: "¿La persona elige la experiencia después?",
      answer:
        "Sí. Solo después de recibir la Vivabox podrá descubrir todas las experiencias disponibles y elegir la que más le emocione.",
    },
    {
      question: "¿La caja está incluida?",
      answer:
        "Sí. La Vivabox incluye la caja física lista para regalar.",
    },
    {
      question: "¿Tiene vencimiento?",
      answer: `Sí. Es válida durante ${validityMonths} meses desde la activación.`,
    },
    {
      question: "¿Dónde puedo usar las experiencias?",
      answer:
        "Por ahora las experiencias están disponibles en Bogotá y Cundinamarca. Vamos sumando más ciudades pronto.",
    },
    {
      question: "¿Puedo escribir un mensaje personal?",
      answer:
        "Sí. Podrás agregarlo después del pago durante el checkout.",
    },
    {
      question: "¿Qué pasa si una experiencia deja de estar disponible?",
      answer:
        "Siempre podrá elegir entre muchas otras experiencias disponibles dentro de su Vivabox.",
    },
  ]

  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-surface py-10 md:py-14">

      <div className="max-w-[720px] mx-auto px-6">

        <h2 className="h2 text-center mb-6">
          Preguntas frecuentes
        </h2>

        <div className="flex flex-col gap-3">

          {faqs.map((faq, i) => {

            const isOpen = open === i

            return (

              <div key={i} className="vb-card px-5 py-4">

                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex items-center justify-between w-full text-left gap-4"
                >

                  <span className="font-medium text-ink text-[15px]">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={18}
                    strokeWidth={1.5}
                    className={`shrink-0 transition-transform duration-300 text-muted ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />

                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-40 mt-2" : "max-h-0"
                  }`}
                >
                  <p
                    onClick={() => setOpen(null)}
                    className="text-muted text-[14px] leading-relaxed cursor-pointer"
                  >
                    {faq.answer}
                  </p>
                </div>

              </div>

            )
          })}

        </div>

      </div>

    </section>
  )
}
