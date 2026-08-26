import Reveal from "@/components/ui/Reveal";

const PRINCIPLES = [
  {
    number: "01",
    title: "No prometemos lo que no podemos cumplir",
    copy: "Si una experiencia no está a la altura, no entra en Vivabox.",
  },
  {
    number: "02",
    title: "Cuidamos a quien regala",
    copy: "Para nosotros, la confianza del comprador es lo primero. Activar, elegir y reservar debe ser sencillo.",
  },
  {
    number: "03",
    title: "Cuidamos a quien recibe",
    copy: "El regalo no termina cuando entregas la caja. Queremos que la experiencia esté a la altura de lo que prometimos.",
  },
  {
    number: "04",
    title: "Cuidamos a nuestros aliados",
    copy: "Trabajamos con proveedores que conocemos, respetamos su trabajo y queremos crecer con ellos.",
  },
] as const;

export default function StoryPrinciples() {
  return (
    <section className="vb-surface-base py-20 md:py-[120px]">

      <div className="max-w-[720px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 mb-14 text-center">
            Lo que no negociamos.
          </h2>
        </Reveal>

        <div className="space-y-10">
          {PRINCIPLES.map((item, index) => (
            <Reveal key={item.number} duration={400} delay={index * 80}>
              <div className="flex gap-5">
                <span className="font-condensed font-semibold text-[28px] leading-none text-primary shrink-0 pt-0.5">
                  {item.number}
                </span>
                <div>
                  <p className="font-semibold text-ink text-lg mb-1.5">
                    {item.title}
                  </p>
                  <p className="text-muted leading-relaxed">{item.copy}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>

    </section>
  );
}
