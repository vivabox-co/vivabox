import Reveal from "@/components/ui/Reveal";

const COMMITMENTS = [
  "Nunca venderíamos una experiencia que no recomendaríamos.",
  "Preferimos decir \"no\" antes que decepcionar a un cliente.",
  "Tratamos a nuestros aliados como verdaderos socios.",
  "La confianza del comprador siempre será nuestra prioridad.",
];

export default function StoryCommitments() {
  return (
    <section className="bg-accent-tint py-20 md:py-[120px]">

      <div className="max-w-[640px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 mb-10">
            Lo que nunca vamos a negociar.
          </h2>
        </Reveal>

        <div className="space-y-4">
          {COMMITMENTS.map((line, index) => (
            <Reveal key={line} duration={400} delay={index * 90}>
              <p className="text-muted leading-relaxed text-lg">
                {line}
              </p>
            </Reveal>
          ))}
        </div>

      </div>

    </section>
  );
}
