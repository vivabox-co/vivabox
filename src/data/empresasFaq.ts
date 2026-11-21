import type { FAQItem } from "@/data/faqSchema";

// Single source of truth for the /empresas FAQ: rendered by EmpresasFAQ and exposed as
// FAQPage JSON-LD in the page. Every answer is self-contained (names Vivabox, gives the
// figure) so it still makes sense when quoted alone by a search engine or an AI assistant.
// Facts come only from what is already on /empresas and the home FAQ. Keep prices in sync
// with EmpresasPricing.
export const empresasFaqItems: FAQItem[] = [
  {
    question: "¿Qué es Vivabox para empresas?",
    answer:
      "Es una caja de regalo de experiencias para tus colaboradores o clientes. Haces un solo pedido y cada persona elige la experiencia que más le guste, entre gastronomía, bienestar, aventura, cultura y estancias. Nosotros gestionamos las reservas.",
  },
  {
    question: "¿Desde cuántas Vivabox puedo pedir y cuánto cuestan?",
    answer:
      "Puedes pedir desde una sola. El precio es de $199.000 por box de 1 a 4, $194.900 de 5 a 19 y $189.900 de 20 a 99. Entre más personas sorprendes, menos pagas por cada box. Para 100 o más armamos una cotización a tu medida.",
  },
  {
    question: "¿Sirve para regalar a colaboradores y a clientes?",
    answer:
      "Sí. Vivabox sirve para reconocer a tu equipo, agradecer a tus clientes o celebrar fechas especiales. Como cada persona elige su experiencia, el regalo le llega con algo que de verdad quiere vivir.",
  },
  {
    question: "¿Cómo reservan las personas su experiencia?",
    answer:
      "Cada persona activa su código, elige la experiencia que quiere y el equipo de Vivabox se encarga de la reserva junto con el aliado que la realiza. Tú no tienes que coordinar nada.",
  },
  {
    question: "¿Puedo poner el logo de mi empresa y un mensaje?",
    answer:
      "Sí. Tu logo va en la caja y en la app, y tu mensaje en la tarjeta. Desde 20 boxes, tu logo va sin costo extra. Por debajo, la box con tu logo queda en $209.900 de 1 a 4 y en $199.000 de 5 a 19. Puedes ver cómo queda en la maqueta de esta misma página.",
  },
  {
    question: "¿Cuánto demora el pedido y cómo se entrega?",
    answer:
      "Tu pedido está listo en 3-4 días. Si le pones tu logo a la caja, son 10 días. Puedes pedirlo físico o digital, y lo enviamos en un solo envío a tu empresa.",
  },
  {
    question: "¿Hasta cuándo pueden usar su Vivabox?",
    answer: "El código es válido durante 6 meses.",
  },
  {
    question: "¿Dónde se disfrutan las experiencias?",
    answer:
      "Hoy en Bogotá y Cundinamarca, con más de 60 experiencias disponibles y una selección que sigue creciendo.",
  },
  {
    question: "¿Cómo se paga y se factura?",
    answer:
      "El pago es por transferencia, con un anticipo del 50 %. Te entregamos factura electrónica a nombre de tu empresa.",
  },
  {
    question: "¿Y si somos más de 100 personas o tenemos un pedido especial?",
    answer:
      "Escríbenos por WhatsApp y te armamos una cotización a tu medida.",
  },
];

export function getEmpresasFAQPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: empresasFaqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
