import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function StoryClosing() {
  return (
    <section className="bg-accent-tint py-20 md:py-[120px]">

      <div className="max-w-[1040px] mx-auto px-6">

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

          <Reveal duration={400} className="order-2 md:order-1 text-center md:text-left">
            <div>
              <h2 className="h2 mb-4">
                Esta historia apenas comienza.
              </h2>

              <p className="text-lg text-muted leading-relaxed mb-8">
                Queremos que cada vez más personas descubran que un buen
                regalo no tiene que ser una cosa.
                <br />
                Puede ser un plan. Una sorpresa. Una historia para contar.
                <br />
                Puede ser una Vivabox.
              </p>

              <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3">
                <Link href="/#incluye" className="vb-btn-primary inline-flex h-12 px-8">
                  Ver las Vivabox
                </Link>
                <Link href="/#experiencias" className="vb-btn-soft inline-flex h-12 px-8">
                  Descubrir experiencias
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal duration={400} delay={100} className="order-1 md:order-2">
            <div className="vb-card relative w-full aspect-[4/5] overflow-hidden">
              <Image
                src="/images/final-cta/persona-regalando-vivabox.webp"
                alt="Alguien recibiendo una Vivabox de regalo"
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
