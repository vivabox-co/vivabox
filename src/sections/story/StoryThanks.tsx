import Reveal from "@/components/ui/Reveal";

export default function StoryThanks() {
  return (
    <section className="vb-surface-base py-20 md:py-[120px]">

      <div className="max-w-[560px] mx-auto px-6 text-center">

        <Reveal duration={400}>
          <h2 className="h2 mb-8">
            Gracias.
          </h2>
        </Reveal>

        <Reveal duration={400} delay={80}>
          <p className="text-muted leading-relaxed">
            Si hoy Vivabox existe, es gracias a cada aliado que creyó en
            nosotros, a cada cliente que decidió probar una nueva forma de
            regalar, y a cada persona que abrió una Vivabox con curiosidad.
          </p>
        </Reveal>

        <Reveal duration={400} delay={160}>
          <p className="text-muted leading-relaxed mt-4">
            Gracias por formar parte de esta historia.
          </p>
        </Reveal>

      </div>

    </section>
  );
}
