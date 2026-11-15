import Reveal from "@/components/ui/Reveal";
import BrandRibbon from "@/components/ui/BrandRibbon";
import type { MapExperience } from "@/features/app-map/config";
import Configurator from "@/features/empresas-configurator/Configurator";

export default function EmpresasCustomization({ mapExperiences }: { mapExperiences: MapExperience[] }) {
  return (
    <section id="personaliza" className="vb-dark bg-ink">

      <div className="max-w-6xl mx-auto px-6 py-6 md:py-6">

        <Configurator
          mapExperiences={mapExperiences}
          header={
            <Reveal>
              <div className="text-white">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.01em] mb-2">
                  ¿Quieres ponerle tu sello?
                </h2>
                <p className="text-white/70 text-base md:text-lg leading-snug">
                  Tu logo en la caja y en la app, y tu mensaje en la tarjeta.
                </p>
              </div>
            </Reveal>
          }
        />

      </div>

      <BrandRibbon />

    </section>
  );
}
