"use client";

import {
  Gift,
  HelpCircle,
  Heart,
  CalendarCheck,
  RefreshCw,
  Clock,
  Smartphone,
  Repeat,
} from "lucide-react";
import FaqAccordion from "@/components/FaqAccordion";

export default function FAQ() {

  const faqs = [
    {
      icon: Gift,
      question: "¿Qué incluye una Vivabox?",
      answer:
        "Una Vivabox incluye una caja de regalo, un catálogo de experiencias, un mensaje personal (opcional) y un código de activación único. Quien la recibe activa su Vivabox, descubre las experiencias disponibles, elige una y el equipo Vivabox acompaña la reserva.",
    },
    {
      icon: HelpCircle,
      question: "¿Cómo funciona Vivabox?",
      answer:
        "Compras una Vivabox física con un código único y la regalas. La persona que la recibe activa su código, entra a la app Vivabox, explora las experiencias disponibles, elige la que más le guste e inicia su reserva con el acompañamiento del equipo Vivabox.",
    },
    {
      icon: Heart,
      question: "¿La persona puede elegir cualquier experiencia?",
      answer:
        "Sí. Puede elegir libremente entre todas las experiencias disponibles incluidas en la Vivabox que recibió.",
    },
    {
      icon: CalendarCheck,
      question: "¿Cómo se reserva una experiencia?",
      answer:
        "Después de activar la Vivabox, la persona elige una experiencia y el equipo Vivabox acompaña todo el proceso de reserva con el prestador.",
    },
    {
      icon: RefreshCw,
      question: "¿Qué pasa si una experiencia no está disponible?",
      answer:
        "Si una experiencia no tiene disponibilidad, podrá elegir otra opción disponible. El equipo Vivabox acompañará el proceso para encontrar la mejor alternativa.",
    },
    {
      icon: Clock,
      question: "¿Cuánto tiempo es válida una Vivabox?",
      answer:
        "Cada Vivabox tiene una vigencia de seis meses desde la fecha de compra.",
    },
    {
      icon: Smartphone,
      question: "¿Qué es la app Vivabox y quién la usa?",
      answer:
        "La app Vivabox es el espacio donde la persona que recibe el regalo descubre y elige su experiencia. El acceso es para el beneficiario, no para quien compra la Vivabox. Allí verá únicamente las experiencias disponibles para su Vivabox y podrá iniciar su reserva con el acompañamiento del equipo Vivabox.",
    },
    {
      icon: Repeat,
      question: "¿Qué pasa si la persona cambia de opinión?",
      answer:
        "Mientras no haya reservado, puede cambiar su elección y seleccionar otra experiencia disponible dentro de su Vivabox.",
    },
  ];

  return (
    <section className="vb-dark bg-ink py-8 md:py-10">

      <div className="container max-w-[640px]">

        <h2 className="h2 text-white text-center mb-6 md:mb-8">
          Preguntas frecuentes
        </h2>

        <FaqAccordion items={faqs} />

      </div>

    </section>
  );
}