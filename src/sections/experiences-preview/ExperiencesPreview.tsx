import { Suspense } from "react";
import { getExperiencesPreview } from "@/services/experiences";
import BrandDots from "@/components/ui/BrandDots";
import ExperiencesGrid from "./ExperiencesGrid";

async function ExperiencesGridLoader() {
  const experiencesPreview = await getExperiencesPreview();
  return <ExperiencesGrid experiencesPreview={experiencesPreview} />;
}

export default function ExperiencesPreview() {
  return (
    <section id="experiencias" className="py-8 md:py-10">

      <div className="max-w-[1200px] mx-auto px-6">

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <BrandDots className="!mb-0" />
            <span className="inline-block bg-accent-tint text-primary text-xs font-semibold px-3 py-1 rounded-full">
              Una experiencia a elegir
            </span>
          </div>
          <h2 className="h2 mb-1">
            Muchas formas de disfrutar una Vivabox
          </h2>
          <p className="text-muted">
            Quien la reciba escoge 1 entre más de 20.
          </p>
        </div>

        {/* SCROLL CONTAINER on mobile/tablet — grid from lg up, where horizontal scroll has no discoverable affordance with a mouse */}
        <Suspense fallback={<div className="text-sm text-muted">Cargando experiencias...</div>}>
          <ExperiencesGridLoader />
        </Suspense>

        <p className="text-sm text-muted mt-3">
          En Bogotá y Cundinamarca.
        </p>

      </div>

    </section>
  );
}
