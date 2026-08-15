import Image from "next/image";
import { Palette, Tag, Mail } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import BrandRibbon from "@/components/ui/BrandRibbon";

const CHIPS = [
  { icon: Palette, text: "Colores corporativos" },
  { icon: Tag, text: "Logo de la empresa" },
  { icon: Mail, text: "Mensaje personalizado" },
] as const;

export default function EmpresasCustomization() {
  return (
    <section className="vb-dark bg-ink">

      <div className="max-w-6xl mx-auto px-6 py-14 md:py-20 grid md:grid-cols-2 items-center gap-14 md:gap-16">

        {/* TEXT */}
        <Reveal>
          <div className="text-white">

            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.01em] mb-4">
              Personaliza tu Vivabox
            </h2>

            <p className="text-white/70 text-lg leading-snug mb-6">
              Tu marca.<br />Tus colores.<br />Tu mensaje.
            </p>

            <p className="text-white/60 leading-relaxed mb-10 max-w-[440px]">
              Podemos personalizar la presentación de Vivabox para que el
              regalo refleje la identidad de tu empresa y haga la experiencia
              aún más especial.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {CHIPS.map((chip) => {
                const Icon = chip.icon;
                return (
                  <div
                    key={chip.text}
                    className="flex items-center gap-1.5 bg-white/10 rounded-full pl-2.5 pr-3.5 py-1.5"
                  >
                    <Icon size={14} strokeWidth={1.5} className="text-primary" />
                    <span className="text-white text-[13px] font-medium">
                      {chip.text}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </Reveal>

        {/* MOCKUP */}
        <Reveal delay={120}>
          <div className="relative w-full max-w-[360px] mx-auto aspect-square">

            <Image
              src="/images/box-includes/vivabox-caja-regalo.webp"
              alt="Vivabox personalizable para empresas"
              fill
              sizes="(min-width: 360px) 360px, 80vw"
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
            />

            {/* CALLOUT — logo */}
            <div className="absolute right-[8%] top-[16%] bg-white/95 rounded-xl px-3 py-2 shadow-lg">
              <span className="text-ink text-xs font-semibold">Logo aquí</span>
            </div>

            {/* CALLOUT — colors */}
            <div className="absolute left-[2%] top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/95 rounded-xl px-3 py-2 shadow-lg">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent-blue" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent-green" />
              <span className="text-ink text-xs font-semibold ml-1">Tus colores</span>
            </div>

            {/* CALLOUT — message */}
            <div className="absolute right-[6%] bottom-[16%] bg-white/95 rounded-xl px-3 py-2 shadow-lg">
              <span className="text-ink text-xs font-semibold">Mensaje personal</span>
            </div>

          </div>
        </Reveal>

      </div>

      <BrandRibbon />

    </section>
  );
}
