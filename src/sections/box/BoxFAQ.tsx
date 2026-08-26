"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

type Props = {
  validityMonths: number
}

export default function BoxFAQ({ validityMonths }: Props) {

  const faqs = [
    {
      question: "¿Qué recibe la persona que regalo?",
      answer:
        "Recibe una caja Vivabox física, lista para regalar, con un mensaje personal y un código único de activación. Con ese código podrá descubrir y elegir su experiencia.",
    },
    {
      question: "¿La persona tiene que elegir la experiencia antes de recibir la Vivabox?",
      answer:
        "No. Tú regalas la Vivabox y la persona que la recibe elige la experiencia después. Así no tienes que adivinar qué le gustaría.",
    },
    {
      question: "¿Cómo funciona la parte digital de la Vivabox?",
      answer:
        "La Vivabox combina una caja física con una experiencia digital sencilla. La persona que la recibe activa su código en nuestra plataforma para descubrir las experiencias, elegir una y reservarla. Quien compra la Vivabox no tiene que usar la plataforma ni hacer ninguna gestión.",
    },
    {
      question: "¿Cómo se reserva la experiencia?",
      answer:
        "Después de elegir una experiencia, la persona inicia la reserva desde nuestra plataforma y nuestro equipo la acompaña con el prestador hasta confirmar la fecha.",
    },
    {
      question: "¿Qué experiencias puede elegir?",
      answer:
        "Puede elegir entre las experiencias disponibles en su Vivabox, con opciones de gastronomía, bienestar, aventura, estancias, cultura y mucho más. El catálogo se sigue ampliando.",
    },
    {
      question: "¿Cuánto tiempo tiene para usarla?",
      answer: `La Vivabox tiene una vigencia de ${validityMonths} meses desde la fecha de compra.`,
    },
    {
      question: "¿Dónde están disponibles las experiencias?",
      answer:
        "Actualmente las experiencias están disponibles en Bogotá y Cundinamarca. Seguimos ampliando el catálogo y sumando nuevos lugares.",
    },
    {
      question: "¿Tengo que hacer algo después de regalar la Vivabox?",
      answer:
        "No. Tú solo tienes que regalarla. La persona que la recibe se encarga de activar su Vivabox y elegir la experiencia, y nuestro equipo la acompaña durante todo el proceso, desde la elección hasta la reserva. No tienes que organizar nada ni gestionar la experiencia por ella.",
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
                    isOpen ? "max-h-52 mt-2" : "max-h-0"
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
