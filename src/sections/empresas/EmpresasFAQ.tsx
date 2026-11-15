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
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-7">

        <Reveal>
          <h2 className="text-2xl md:text-3xl font-semibold text-center tracking-[-0.01em] text-white mb-4 md:mb-5">
            Preguntas frecuentes
          </h2>
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
