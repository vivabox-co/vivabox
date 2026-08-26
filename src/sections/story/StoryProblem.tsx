import Reveal from "@/components/ui/Reveal";

export default function StoryProblem() {
  return (
    <section className="vb-dark bg-ink py-16 md:py-24">

      <div className="max-w-[600px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 text-white mb-10">
            Todo empezó con un problema muy simple.
          </h2>
        </Reveal>

        <Reveal duration={400} delay={80}>
          <div>
            <p className="text-white/70 leading-relaxed mb-4">
              Queríamos hacer un buen regalo. Algo que no terminara guardado
              en un cajón, algo que realmente diera ganas de usar.
            </p>

            <p className="text-white/70 leading-relaxed">
              Pero regalar una experiencia tiene su propio problema: ¿cómo
              saber qué le va a gustar a otra persona? ¿Una cena? ¿Un spa?
              ¿Una aventura? ¿Algo para compartir en pareja?
            </p>
          </div>
        </Reveal>

        <Reveal duration={400} delay={160}>
          <div className="max-w-[460px] mx-auto text-center my-10 md:my-14">
            <p className="text-white/40 text-sm mb-4">Y ahí apareció la idea:</p>
            <p className="italic font-medium text-white text-[26px] md:text-[34px] leading-[1.25] text-balance">
              &ldquo;¿Por qué quien regala tiene que elegir la experiencia?&rdquo;
            </p>
          </div>
        </Reveal>

        <Reveal duration={400} delay={220}>
          <p className="text-white/60 text-base leading-relaxed">
            Que regale la sorpresa.
            <br />
            Que quien recibe elija el plan.
          </p>
        </Reveal>

      </div>

    </section>
  );
}
