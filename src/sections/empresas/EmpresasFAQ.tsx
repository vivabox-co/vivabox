import { ChevronDown } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import BrandRibbon from "@/components/ui/BrandRibbon";

// DRAFT: every answer only restates facts already on the page (prices, 6 months, 3-4 / 10
// days, 50 % anticipo, logo + message). Anything new (e.g. how the digital version works)
// must be confirmed before it is added here.
const QUESTIONS = [
  {
    q: "¿Desde cuántas Vivabox puedo pedir?",
    a: "Desde una sola. Entre más personas sorprendes, menos pagas por cada box.",
  },
  {
    q: "¿Cómo reservan las personas?",
    a: "Cada persona elige su experiencia y nosotros nos encargamos de la reserva. Tú no tienes que coordinar nada.",
  },
  {
    q: "¿Hasta cuándo pueden usar su Vivabox?",
    a: "El código es válido durante 6 meses.",
  },
  {
    q: "¿Puedo poner mi logo y un mensaje?",
    a: "Sí. Tu logo va en la caja y en la app, y tu mensaje en la tarjeta. Puedes verlo en la maqueta de más arriba.",
  },
  {
    q: "¿Cuánto demora el pedido?",
    a: "Listo en 3-4 días. Si le pones tu logo a la caja, son 10 días.",
  },
  {
    q: "¿Cómo se paga y se factura?",
    a: "Por transferencia, con un anticipo del 50 %. Te entregamos factura electrónica.",
  },
] as const;

export default function EmpresasFAQ() {
  return (
    <section id="preguntas-empresas" className="vb-dark bg-ink">
      <div className="max-w-3xl lg:max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-7 lg:py-9 lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">

        <Reveal className="lg:order-2">
          <div className="lg:text-right lg:sticky lg:top-24">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-center lg:text-right tracking-[-0.01em] text-white mb-4 md:mb-5 lg:mb-3">
              Preguntas frecuentes
            </h2>
            <a
              href="https://wa.me/573142590291?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20Vivabox%20para%20mi%20empresa."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-block text-[15px] text-white/70 underline underline-offset-4 decoration-white/30 hover:text-white transition-colors"
            >
              ¿Otra duda? Escríbenos por WhatsApp
            </a>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="vb-card divide-y divide-white/10 px-4 md:px-7">
            {QUESTIONS.map((item) => (
              <details key={item.q} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-white text-[15px] md:text-base font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    size={20}
                    strokeWidth={1.5}
                    className="shrink-0 text-primary transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-2 text-white/70 text-[15px] leading-relaxed pr-8">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>

      </div>
      <BrandRibbon />

    </section>
  );
}
