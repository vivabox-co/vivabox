import Reveal from "@/components/ui/Reveal";

export default function StoryProblem() {
  return (
    <section className="vb-dark bg-ink py-20 md:py-[120px]">

      <div className="max-w-[640px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 text-white mb-8">
            Todo empezó con un problema muy simple.
          </h2>
        </Reveal>

        <Reveal duration={400} delay={80}>
          <div>
            <p className="text-white/70 leading-relaxed mb-4">
              Queríamos hacer un buen regalo.
            </p>

            <p className="text-white/70 leading-relaxed mb-4">
              Algo que no terminara guardado en un cajón. Algo que realmente
              diera ganas de usar.
            </p>

            <p className="text-white/70 leading-relaxed mb-4">
              Pero regalar una experiencia tiene su propio problema: ¿cómo
              saber qué le va a gustar a otra persona?
            </p>

            <p className="text-white/70 leading-relaxed mb-8">
              ¿Una cena? ¿Un spa? ¿Una aventura? ¿Algo para compartir en
              pareja?
            </p>

            <p className="text-white/70 leading-relaxed mb-4">
              Y ahí apareció la idea:
            </p>

            <p className="text-xl md:text-2xl font-semibold text-white mb-4">
              ¿Por qué quien regala tiene que elegir la experiencia?
            </p>

            <p className="text-white text-lg leading-relaxed">
              Que regale la sorpresa.
              <br />
              Que quien recibe elija el plan.
            </p>
          </div>
        </Reveal>

      </div>

    </section>
  );
}
