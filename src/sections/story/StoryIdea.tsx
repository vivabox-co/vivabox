import Reveal from "@/components/ui/Reveal";

export default function StoryIdea() {
  return (
    <section className="bg-accent-tint py-20 md:py-[120px]">

      <div className="max-w-[720px] mx-auto px-6 text-center">

        <Reveal duration={400}>
          <p className="text-base md:text-lg text-muted/70 line-through decoration-1 mb-3">
            No elegir la experiencia.
          </p>
        </Reveal>

        <Reveal duration={400} delay={80}>
          <svg
            viewBox="0 0 24 32"
            className="w-4 h-6 mx-auto mb-4"
            fill="none"
          >
            <path
              d="M12,2 C11.5,10 12.2,18 11.8,27"
              style={{ stroke: "var(--color-primary)" }}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M5,21 C7.5,24.5 9.8,27.5 12,29.5 C14,27 16.3,24 19,20.5"
              style={{ stroke: "var(--color-primary)" }}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Reveal>

        <Reveal duration={400} delay={160}>
          <h2 className="text-[36px] leading-[1.08] md:text-[60px] font-semibold tracking-tight mb-10 text-balance">
            Regalar la posibilidad
            <br />
            de elegir.
          </h2>
        </Reveal>

        <Reveal duration={400} delay={240}>
          <div className="max-w-[520px] mx-auto">
            <p className="text-muted leading-relaxed mb-4">
              En lugar de escoger una experiencia específica, regalas una
              Vivabox.
            </p>

            <p className="text-muted leading-relaxed">
              Después, quien la recibe explora las experiencias disponibles y
              elige la que más le emocione. Así el regalo sigue siendo una
              sorpresa, pero también es personal.
            </p>
          </div>
        </Reveal>

      </div>

    </section>
  );
}
