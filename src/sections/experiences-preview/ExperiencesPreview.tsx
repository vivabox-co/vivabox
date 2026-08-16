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

      <div className="max-w-[1200px] mx-auto px-6 mb-6">
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

      {/* SCROLL CONTAINER on mobile/tablet — wrapper stays edge-to-edge so no static white gutter shows while scrolling; the 16px inset lives on the scrollable row itself (ExperiencesGrid) so it scrolls away with the content. Padding restored at lg where the row no longer scrolls past the container. */}
      <div className="max-w-[1200px] mx-auto lg:px-6">
        <Suspense fallback={<div className="text-sm text-muted px-4 lg:px-0">Cargando experiencias...</div>}>
          <ExperiencesGridLoader />
        </Suspense>
      </div>

    </section>
  );
}
