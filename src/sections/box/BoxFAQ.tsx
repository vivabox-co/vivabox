"use client"

import FaqAccordion from "@/components/FaqAccordion"

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
      question: "¿Cómo funciona la app de la Vivabox?",
      answer:
        "La Vivabox combina una caja física con la app Vivabox, sencilla de usar. La persona que la recibe activa ahí su código para descubrir las experiencias, elegir una y reservarla. Quien compra la Vivabox no tiene que usar la app ni hacer ninguna gestión.",
    },
    {
      question: "¿Cómo se reserva la experiencia?",
      answer:
        "Después de elegir una experiencia, la persona inicia la reserva desde la app Vivabox y nuestro equipo la acompaña con el prestador hasta confirmar la fecha.",
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

  return (
    <section className="bg-surface py-10 md:py-14">

      <div className="max-w-[640px] mx-auto px-6">

        <h2 className="h2 text-center mb-9">
          Preguntas frecuentes
        </h2>

        <FaqAccordion items={faqs} />

      </div>

    </section>
  )
}
