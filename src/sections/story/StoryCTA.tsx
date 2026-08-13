import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

export default function StoryCTA() {
  return (
    <section className="bg-accent-tint py-20 md:py-[120px]">

      <div className="max-w-[1040px] mx-auto px-6">

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

          <Reveal duration={400}>
            <div className="vb-card relative w-full aspect-[4/5] overflow-hidden">
              <Image
                src="/images/final-cta/persona-regalando-vivabox.png"
                alt="Alguien recibiendo una Vivabox de regalo"
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal duration={400} delay={100}>
            <div className="text-center md:text-left">
              <h2 className="h2 mb-4">
                Descubre Vivabox
              </h2>

              <p className="text-lg text-muted leading-relaxed mb-8">
                Un regalo. Muchas experiencias. El placer de elegir.
              </p>

              <a
                href="/#incluye"
                className="vb-btn-primary inline-flex h-12 px-8"
              >
                Ver las Vivabox
              </a>
            </div>
          </Reveal>

        </div>

      </div>

    </section>
  );
}
