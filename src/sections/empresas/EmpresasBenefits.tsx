import Reveal from "@/components/ui/Reveal";

const COLUMNS = [
  {
    eyebrow: "Para tu empresa",
    statement: "Un solo pedido, cero complicaciones",
    text: "Coordinas todo en un solo lugar, sin adivinar qué le gusta a cada persona.",
  },
  {
    eyebrow: "Para quien recibe",
    statement: "Un regalo que se siente personal",
    text: "Cada quien elige la experiencia que más le llama, cuando mejor le quede.",
  },
] as const;

export default function EmpresasBenefits() {
  return (
    <section className="bg-white py-14 md:py-12">

      <div className="max-w-4xl mx-auto px-6">

        <Reveal>
          <h2 className="text-3xl md:text-4xl font-semibold text-center tracking-[-0.01em] mb-8 md:mb-7">
            Un solo regalo.<br />Miles de gustos.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black/10">

          {COLUMNS.map((col, index) => (
            <Reveal key={col.eyebrow} delay={index * 120}>
              <div className={`py-5 md:py-0 ${index === 0 ? "md:pr-12" : "md:pl-12 pt-6 md:pt-0"}`}>
                <p className="text-primary text-[13px] uppercase tracking-[0.14em] font-semibold mb-4">
                  {col.eyebrow}
                </p>
                <h3 className="text-2xl font-semibold tracking-[-0.01em] mb-3">
                  {col.statement}
                </h3>
                <p className="text-[#6B6B6B] leading-relaxed">
                  {col.text}
                </p>
              </div>
            </Reveal>
          ))}

        </div>

      </div>

    </section>
  );
}
