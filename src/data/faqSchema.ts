export type FAQItem = {
  question: string
  answer: string
}

export const faqSchemaItems: FAQItem[] = [
  {
    question: "¿Qué es Vivabox?",
    answer:
      "Vivabox es una caja de regalo de experiencias que permite a quien la recibe elegir la experiencia que más le guste y reservarla con el acompañamiento del equipo Vivabox.",
  },
  {
    question: "¿Qué incluye una Vivabox?",
    answer:
      "Incluye una caja de regalo física, un catálogo de experiencias, un mensaje personal (opcional) y un código de activación único.",
  },
  {
    question: "¿Cómo funciona Vivabox?",
    answer:
      "Compras la Vivabox, la regalas y la persona que la recibe activa el código, descubre las experiencias disponibles, elige una y reserva con el acompañamiento del equipo Vivabox.",
  },
  {
    question: "¿Cómo se activa una Vivabox?",
    answer:
      "Escaneando el código QR o ingresando el código de activación en la plataforma Vivabox.",
  },
  {
    question: "¿Qué experiencias puedo elegir?",
    answer:
      "Experiencias de gastronomía, bienestar, aventura, cultura y estancias.",
  },
  {
    question: "¿La persona puede elegir cualquier experiencia?",
    answer:
      "Puede elegir libremente entre todas las experiencias disponibles incluidas en la Vivabox recibida.",
  },
  {
    question: "¿Cuántas experiencias hay disponibles?",
    answer:
      "Más de 50 experiencias disponibles en Bogotá y Cundinamarca. La selección continúa creciendo constantemente.",
  },
  {
    question: "¿Hay experiencias gastronómicas?",
    answer:
      "Sí. Restaurantes, brunches, cenas, talleres de cocina y muchas otras experiencias gastronómicas.",
  },
  {
    question: "¿Hay experiencias de bienestar?",
    answer:
      "Sí. Spas, masajes, yoga, relajación y muchas otras experiencias de bienestar.",
  },
  {
    question: "¿Hay experiencias de aventura?",
    answer:
      "Sí. Actividades al aire libre, deportes y experiencias de aventura.",
  },
  {
    question: "¿Hay estancias?",
    answer:
      "Sí. Hoteles, glamping, escapadas y otras experiencias para desconectarse.",
  },
  {
    question: "¿Hay experiencias culturales?",
    answer:
      "Sí. Talleres, actividades artísticas y otras experiencias culturales.",
  },
  {
    question: "¿Cómo se reserva una experiencia?",
    answer:
      "Después de activar la Vivabox, la persona elige una experiencia y el equipo Vivabox acompaña todo el proceso de reserva.",
  },
  {
    question: "¿Quién organiza la reserva?",
    answer:
      "El equipo Vivabox acompaña el proceso de reserva junto con el prestador de la experiencia.",
  },
  {
    question: "¿Qué pasa si una experiencia no está disponible?",
    answer:
      "Podrá elegir otra experiencia disponible y el equipo Vivabox ayudará a encontrar la mejor alternativa.",
  },
  {
    question: "¿Puedo cambiar de experiencia?",
    answer: "Sí, mientras no haya sido reservada.",
  },
  {
    question: "¿Dónde se pueden disfrutar las experiencias?",
    answer: "Actualmente en Bogotá y Cundinamarca.",
  },
  {
    question: "¿Cuánto cuesta una Vivabox?",
    answer: "El precio vigente aparece en la página de compra de Vivabox.",
  },
  {
    question: "¿Qué incluye el precio?",
    answer:
      "El precio incluye la caja de regalo física, el catálogo de experiencias, el código de activación y una experiencia a elegir, además del acompañamiento del equipo Vivabox durante todo el proceso de reserva.",
  },
  {
    question: "¿Hay costos adicionales?",
    answer:
      "No. La persona que recibe la Vivabox no tiene que pagar ningún valor adicional para disfrutar la experiencia elegida.",
  },
  {
    question: "¿Cuánto tiempo es válida una Vivabox?",
    answer: "Seis meses desde la fecha de compra.",
  },
  {
    question: "¿Puedo añadir un mensaje personal?",
    answer:
      "Sí. La caja permite incluir un mensaje personal para la persona que recibe el regalo.",
  },
  {
    question: "¿Es un buen regalo para cumpleaños?",
    answer:
      "Sí. Vivabox permite que cada persona elija la experiencia que más le guste.",
  },
  {
    question: "¿Es un buen regalo para aniversarios?",
    answer: "Sí. Hay numerosas experiencias para disfrutar en pareja.",
  },
  {
    question: "¿Es un buen regalo para empresas?",
    answer:
      "Sí. Vivabox ofrece soluciones para regalos empresariales y reconocimiento de colaboradores, equipos y clientes.",
  },
  {
    question: "¿Vivabox realiza las experiencias?",
    answer:
      "No. Las experiencias son realizadas por aliados cuidadosamente seleccionados. Vivabox facilita la activación, la elección y acompaña todo el proceso de reserva.",
  },
]

export function getFAQPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSchemaItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}
