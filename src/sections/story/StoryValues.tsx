import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

export default function StoryValues() {
  return (
    <section className="vb-surface-base py-20 md:py-[120px]">

      <div className="max-w-[1040px] mx-auto px-6">

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

          <Reveal duration={400} className="order-2 md:order-1">
            <div>
              <h2 className="h2 mb-6">
                Hecha en Colombia
              </h2>

              <p className="text-muted leading-relaxed mb-4">
                Vivabox nació en Colombia y sigue creciendo aquí.
              </p>

              <p className="text-muted leading-relaxed mb-4">
                Trabajamos con empresas locales porque creemos que las
                mejores experiencias nacen de personas apasionadas por lo que
                hacen.
              </p>

              <p className="text-muted leading-relaxed">
                Cada Vivabox busca conectar a quien regala, a quien recibe y
                a quienes hacen posible cada experiencia.
              </p>
            </div>
          </Reveal>

          <Reveal duration={400} delay={100} className="order-1 md:order-2">
            <div className="vb-card relative w-full aspect-[4/5] overflow-hidden">
              <Image
                src="/images/occasions/regalo-experiencia-pareja-vivabox.webp"
                alt="Momento compartido gracias a una experiencia Vivabox"
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
              />
            </div>
          </Reveal>

        </div>

      </div>

    </section>
  );
}
