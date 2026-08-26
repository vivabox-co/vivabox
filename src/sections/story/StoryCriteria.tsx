import Reveal from "@/components/ui/Reveal";

const CRITERIA = [
  {
    number: "01",
    title: "La experiencia",
    question: "¿Es algo que realmente vale la pena vivir?",
  },
  {
    number: "02",
    title: "El equipo",
    question: "¿Quién está detrás y cómo trabaja?",
  },
  {
    number: "03",
    title: "La calidad",
    question: "¿La experiencia está a la altura de lo que promete?",
  },
  {
    number: "04",
    title: "La confianza",
    question:
      "¿Podemos recomendarla con tranquilidad a alguien que está haciendo un regalo?",
  },
] as const;

const LAST_CRITERION = {
  number: "05",
  title: "La experiencia de reserva",
  question: "¿Podemos hacer que elegir y reservar sea sencillo?",
} as const;

export default function StoryCriteria() {
  return (
    <section className="bg-white py-24 md:py-[140px]">

      <div className="max-w-[760px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 mb-4 text-center text-balance">
            No se trata de tener más experiencias.
            <br />
            Se trata de elegirlas bien.
          </h2>
        </Reveal>

        <Reveal duration={400} delay={60}>
          <p className="text-muted leading-relaxed text-center max-w-[420px] mx-auto mb-16 md:mb-20">
            Antes de incluir una experiencia, nos hacemos preguntas simples:
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-x-14 gap-y-12 md:gap-y-14">
          {CRITERIA.map((item, index) => (
            <Reveal key={item.number} duration={400} delay={index * 80}>
              <div className="flex gap-5">
                <span className="font-condensed font-semibold text-[38px] leading-none text-primary shrink-0">
                  {item.number}
                </span>
                <div className="pt-1">
                  <p className="font-semibold text-ink mb-1.5">{item.title}</p>
                  <p className="text-muted leading-relaxed">{item.question}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal duration={400} delay={CRITERIA.length * 80}>
          <div className="flex gap-5 max-w-[380px] mx-auto mt-14 md:mt-16 pt-14 md:pt-16 border-t border-ink/10">
            <span className="font-condensed font-semibold text-[38px] leading-none text-primary shrink-0">
              {LAST_CRITERION.number}
            </span>
            <div className="pt-1">
              <p className="font-semibold text-ink mb-1.5">{LAST_CRITERION.title}</p>
              <p className="text-muted leading-relaxed">{LAST_CRITERION.question}</p>
            </div>
          </div>
        </Reveal>

      </div>

    </section>
  );
}
