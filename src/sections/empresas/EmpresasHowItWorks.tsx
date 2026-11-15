import { ShoppingBag, Gift, CalendarCheck } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const STEPS = [
  { icon: ShoppingBag, title: "Compras", subtitle: "Un solo pedido, físico o digital." },
  { icon: Gift, title: "Cada persona elige", subtitle: "La experiencia que más le llama." },
  { icon: CalendarCheck, title: "Vivabox gestiona", subtitle: "Nosotros coordinamos la fecha." },
] as const;

// Always three columns, phone included: short, wide, little vertical space.
export default function EmpresasHowItWorks() {
  return (
    <section id="como-funciona-empresas" className="vb-light bg-white">

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-6 lg:py-8 lg:grid lg:grid-cols-[280px_1fr] lg:items-center lg:gap-10">

        <Reveal>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-center lg:text-left tracking-[-0.01em] text-ink mb-4 md:mb-5 lg:mb-0">
            Cómo funciona
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="relative">

            <div className="absolute left-[16%] right-[16%] top-6 md:top-6 h-px bg-black/15" />

            <div className="relative grid grid-cols-3 gap-2 md:gap-6">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex flex-col items-center text-center">
                    <div className="vb-icon-btn h-12 w-12 md:h-12 md:w-12 mb-2 md:mb-2.5">
                      {step.icon === Gift ? (
                        <span
                          aria-hidden
                          className="block h-6 w-6 bg-primary"
                          style={{
                            WebkitMask: "url(/icons/logo-only-white.svg) center / contain no-repeat",
                            mask: "url(/icons/logo-only-white.svg) center / contain no-repeat",
                          }}
                        />
                      ) : (
                        <Icon size={20} strokeWidth={1.5} className="text-primary" />
                      )}
                    </div>
                    <span className="text-ink text-[14px] md:text-lg font-semibold leading-snug">
                      {step.title}
                    </span>
                    <span className="text-ink/65 text-[12px] md:text-[15px] leading-snug max-w-[240px] mt-1">
                      {step.subtitle}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </Reveal>

      </div>

    </section>
  );
}
