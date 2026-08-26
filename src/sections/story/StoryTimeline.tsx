import Reveal from "@/components/ui/Reveal";

const MILESTONES = [
  {
    year: "2024",
    title: "Nace la idea.",
    copy: "Empezamos a darle forma a una manera más sencilla de regalar experiencias en Colombia.",
  },
  {
    year: "2025",
    title: "Nos unimos.",
    copy: "Gotie y Frank deciden unir sus experiencias y capacidades.",
  },
  {
    year: "2026",
    title: "Vivabox toma forma.",
    copy: "Construimos el producto, la plataforma y empezamos a lanzar.",
  },
] as const;

export default function StoryTimeline() {
  return (
    <section className="bg-white py-24 md:py-[140px]">

      <div className="max-w-[520px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 mb-14 md:mb-16 text-center">
            Estamos construyendo esto paso a paso.
          </h2>
        </Reveal>

        <div className="relative pl-8">

          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-ink/10" />

          <div className="space-y-9">
            {MILESTONES.map((item, index) => (
              <Reveal key={item.year} duration={400} delay={index * 90}>
                <div className="relative">
                  <span className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-white" />
                  <span className="font-condensed font-semibold text-lg text-primary align-baseline">
                    {item.year}
                  </span>{" "}
                  <span className="font-semibold text-ink text-lg align-baseline">
                    {item.title}
                  </span>
                  <p className="text-muted leading-relaxed mt-1">{item.copy}</p>
                </div>
              </Reveal>
            ))}

            <Reveal duration={400} delay={MILESTONES.length * 90}>
              <div className="relative">
                <span className="absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full bg-ink/20 ring-4 ring-white" />
                <span className="font-semibold text-ink/50 text-lg">
                  Lo que sigue
                </span>
                <p className="text-muted leading-relaxed mt-1">
                  Seguir seleccionando buenas experiencias y hacer que
                  regalar sea cada vez más natural en Colombia.
                </p>
              </div>
            </Reveal>
          </div>

        </div>

      </div>

    </section>
  );
}
