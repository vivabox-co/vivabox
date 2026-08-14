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
          <BrandDots />
          <h2 className="h2 mb-1">
            Muchas formas de disfrutar una Vivabox
          </h2>
          <p className="text-muted">
            Quien la reciba escoge 1 entre más de 20,
            <br />
            <span className="font-medium">en Bogotá y Cundinamarca.</span>
          </p>
        </div>

        {/* SCROLL CONTAINER on mobile/tablet — grid from lg up, where horizontal scroll has no discoverable affordance with a mouse */}
        <Suspense fallback={<div className="text-sm text-muted">Cargando experiencias...</div>}>
          <ExperiencesGridLoader />
        </Suspense>

      </div>

    </section>
  );
}
