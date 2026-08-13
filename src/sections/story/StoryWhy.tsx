import Reveal from "@/components/ui/Reveal";

export default function StoryWhy() {
  return (
    <section className="vb-dark bg-ink py-20 md:py-[120px]">

      <div className="max-w-[640px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 text-white mb-8">
            Todo empezó con una pregunta.
          </h2>
        </Reveal>

        <Reveal duration={400} delay={80}>
          <div>
            <p className="text-white/70 leading-relaxed mb-4">
              Regalar nunca ha sido tan fácil como parece.
            </p>

            <p className="text-white/70 leading-relaxed mb-4">
              Queremos sorprender a alguien, pero siempre aparece la misma
              duda:
            </p>

            <p className="text-xl md:text-2xl font-semibold text-white mb-4">
              ¿Y si no le gusta?
            </p>

            <p className="text-white/70 leading-relaxed mb-4">
              Muchas veces terminamos regalando algo que la otra persona ya
              tiene, no necesita o simplemente no era lo que esperaba.
            </p>

            <p className="text-white/70 leading-relaxed">
              Pensamos que tenía que existir una mejor forma.
            </p>
          </div>
        </Reveal>

      </div>

    </section>
  );
}
