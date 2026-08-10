import { ShoppingBag, Gift, CalendarCheck } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import BrandRibbon from "@/components/ui/BrandRibbon";

const STEPS = [
  { icon: ShoppingBag, title: "Compra", subtitle: "Física o digital" },
  { icon: Gift, title: "Regala", subtitle: "Cada persona elige su experiencia" },
  { icon: CalendarCheck, title: "Vivabox gestiona la reserva", subtitle: null },
] as const;

export default function EmpresasHowItWorks() {
  return (
    <section id="como-funciona-empresas" className="bg-ink">

      <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">

        <Reveal>
          <h2 className="text-3xl md:text-4xl font-semibold text-center tracking-[-0.01em] text-white mb-10 md:mb-14">
            Cómo funciona
          </h2>
        </Reveal>

        {/* DESKTOP — horizontal timeline */}
        <Reveal className="hidden md:block" delay={100}>
          <div className="relative">

            <div className="absolute left-0 right-0 top-7 h-px bg-white/15" />

            <div className="relative grid grid-cols-3">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex flex-col items-center text-center px-2">
                    <div className="h-14 w-14 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mb-5">
                      <Icon size={22} strokeWidth={1.5} className="text-primary" />
                    </div>
                    <span className="text-white text-base font-semibold leading-snug max-w-[200px]">
                      {step.title}
                    </span>
                    {step.subtitle && (
                      <span className="text-white/60 text-sm leading-snug max-w-[200px] mt-1">
                        {step.subtitle}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </Reveal>

        {/* MOBILE — vertical timeline */}
        <div className="md:hidden relative pl-7">

          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-white/15" />

          <div className="space-y-10">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={index * 80}>
                  <div className="relative flex items-center gap-4">
                    <div className="relative z-10 h-14 w-14 shrink-0 rounded-full bg-ink border border-white/15 flex items-center justify-center -ml-7">
                      <Icon size={20} strokeWidth={1.5} className="text-primary" />
                    </div>
                    <div>
                      <span className="block text-white text-[15px] font-semibold leading-snug">
                        {step.title}
                      </span>
                      {step.subtitle && (
                        <span className="block text-white/60 text-[13px] leading-snug mt-0.5">
                          {step.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

        </div>

      </div>

      <BrandRibbon />

    </section>
  );
}
