import Reveal from "@/components/ui/Reveal";
import BrandDots from "@/components/ui/BrandDots";

const PRINCIPLES = [
  {
    title: "No prometemos lo que no podemos cumplir",
    copy: "Si una experiencia no está a la altura, no entra en Vivabox.",
  },
  {
    title: "Cuidamos a quien regala",
    copy: "Para nosotros, la confianza del comprador es lo primero. Activar, elegir y reservar debe ser sencillo.",
  },
  {
    title: "Cuidamos a quien recibe",
    copy: "El regalo no termina cuando entregas la caja. Queremos que la experiencia esté a la altura de lo que prometimos.",
  },
  {
    title: "Cuidamos a nuestros aliados",
    copy: "Trabajamos con proveedores que conocemos, respetamos su trabajo y queremos crecer con ellos.",
  },
] as const;

export default function StoryPrinciples() {
  return (
    <section className="bg-white py-24 md:py-[140px]">

      <div className="max-w-[760px] mx-auto px-6">

        <Reveal duration={400}>
          <BrandDots className="justify-center" />
          <h2 className="h2 mb-16 md:mb-20 text-center">
            Lo que no negociamos.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-x-14 gap-y-12 md:gap-y-14">
          {PRINCIPLES.map((item, index) => (
            <Reveal key={item.title} duration={400} delay={index * 80}>
              <div className="border-t border-ink/10 pt-6">
                <p className="font-semibold text-ink text-lg mb-2">
                  {item.title}
                </p>
                <p className="text-muted leading-relaxed">{item.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>

    </section>
  );
}
