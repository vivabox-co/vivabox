import Reveal from "@/components/ui/Reveal";

const MILESTONES = [
  {
    year: "2024",
    title: "Nace la idea.",
    copy: "Empezamos a darle forma a una idea: hacer que regalar experiencias en Colombia fuera más sencillo, confiable y especial.",
  },
  {
    year: "2025",
    title: "Nos unimos.",
    copy: "Gotie y Frank deciden unir sus experiencias y capacidades para construir Vivabox juntos.",
  },
  {
    year: "2026",
    title: "Vivabox toma forma.",
    copy: "Formalizamos el proyecto, construimos el producto, desarrollamos nuestra plataforma y empezamos a lanzar nuestras primeras Vivabox.",
  },
] as const;

export default function StoryTimeline() {
  return (
    <section className="bg-accent-tint py-20 md:py-[120px]">

      <div className="max-w-[560px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 mb-14 text-center">
            Estamos construyendo esto paso a paso.
          </h2>
        </Reveal>

        <div className="relative pl-8">

          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-ink/10" />

          <div className="space-y-12">
            {MILESTONES.map((item, index) => (
              <Reveal key={item.year} duration={400} delay={index * 90}>
                <div className="relative">
                  <span className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-accent-tint" />
                  <p className="font-condensed font-semibold text-2xl text-primary leading-none mb-2">
                    {item.year}
                  </p>
                  <p className="font-semibold text-ink text-lg mb-1.5">
                    {item.title}
                  </p>
                  <p className="text-muted leading-relaxed">{item.copy}</p>
                </div>
              </Reveal>
            ))}

            <Reveal duration={400} delay={MILESTONES.length * 90}>
              <div className="relative">
                <span className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full bg-ink/20 ring-4 ring-accent-tint" />
                <p className="font-condensed font-semibold text-2xl text-ink/40 leading-none mb-2">
                  Lo que sigue
                </p>
                <p className="text-muted leading-relaxed">
                  Seguir seleccionando buenas experiencias, mejorar cada parte
                  del servicio y hacer que regalar experiencias sea cada vez
                  más natural en Colombia.
                </p>
              </div>
            </Reveal>
          </div>

        </div>

      </div>

    </section>
  );
}
