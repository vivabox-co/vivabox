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
  {
    number: "05",
    title: "La experiencia de reserva",
    question: "¿Podemos hacer que elegir y reservar sea sencillo?",
  },
] as const;

export default function StoryCriteria() {
  return (
    <section className="bg-accent-tint py-20 md:py-[120px]">

      <div className="max-w-[840px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 mb-4 text-center text-balance">
            No se trata de tener más experiencias.
            <br />
            Se trata de elegirlas bien.
          </h2>
        </Reveal>

        <Reveal duration={400} delay={60}>
          <p className="text-muted leading-relaxed text-center max-w-[440px] mx-auto mb-14">
            Antes de incluir una experiencia, nos hacemos preguntas simples:
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10 md:gap-y-12">
          {CRITERIA.map((item, index) => (
            <Reveal
              key={item.number}
              duration={400}
              delay={index * 80}
              className={index === CRITERIA.length - 1 ? "sm:col-span-2 sm:max-w-[380px] sm:mx-auto" : ""}
            >
              <div className="flex gap-4">
                <span className="font-condensed font-semibold text-[36px] leading-none text-primary shrink-0">
                  {item.number}
                </span>
                <div className="pt-1">
                  <p className="font-semibold text-ink mb-1">{item.title}</p>
                  <p className="text-muted leading-relaxed">{item.question}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>

    </section>
  );
}
