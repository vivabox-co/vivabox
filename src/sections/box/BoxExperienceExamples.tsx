import { Suspense } from "react"
import { getExperienceExamples } from "@/services/experiences"
import BoxExperienceExamplesGrid from "./BoxExperienceExamplesGrid"

async function BoxExperienceExamplesLoader() {
  const experiences = await getExperienceExamples()
  return <BoxExperienceExamplesGrid experiences={experiences} />
}

export default function BoxExperienceExamples() {
  return (
    <section className="vb-dark bg-ink py-10 md:py-14">

      <div className="max-w-[1000px] mx-auto px-6">

        <p className="text-primary text-[13px] font-semibold tracking-[0.08em] uppercase mb-2">
          Ejemplos de experiencias
        </p>

        <h2 className="h2 text-white mb-6 md:mb-8">
          Algunas experiencias que podría elegir
        </h2>

        <Suspense fallback={<div className="text-sm text-white/60">Cargando experiencias...</div>}>
          <BoxExperienceExamplesLoader />
        </Suspense>

      </div>

    </section>
  )
}
