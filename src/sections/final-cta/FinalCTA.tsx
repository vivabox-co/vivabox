import Image from "next/image";
import { boxes } from "@/data/boxes";

const vivabox = boxes[0];

export default function FinalCTA() {
  return (
    <section className="relative w-screen left-1/2 -translate-x-1/2 bg-white overflow-hidden">

      <div className="max-w-[1200px] mx-auto grid grid-cols-2 items-stretch h-[480px] sm:h-[520px] md:h-[560px] lg:h-[620px]">

        {/* PHOTO */}

        <div className="relative w-full h-full">
          <Image
            src="/images/final-cta/persona-regalando-vivabox.webp"
            alt="Persona regalando una caja de regalo Vivabox"
            fill
            sizes="(min-width: 1200px) 600px, 50vw"
            className="object-cover"
          />
        </div>

        {/* TEXT */}

        <div className="flex flex-col items-center justify-center px-4 sm:px-8 md:px-14 lg:px-20 text-center">

          <h2 className="text-ink text-[28px] sm:text-[34px] md:text-[46px] lg:text-[54px] font-semibold leading-[1.1] tracking-tight mb-5 md:mb-7">
            Regalar.
            <br />
            Sorprender.
            <br />
            ¡Qué nota!
          </h2>

          <Image
            src="/icons/vivabox.webp"
            alt="Vivabox, caja de regalo de experiencias"
            width={170}
            height={43}
            className="mb-6 md:mb-8"
          />

          <p className="text-muted text-[13px] sm:text-[14px] mb-6 md:mb-8">
            La forma más fácil de regalar experiencias.
          </p>

          <a
            href={`/proximamente?next=/cajas/${vivabox.slug}`}
            aria-label="Comprar Vivabox"
            className="vb-btn-primary px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 text-[15px] sm:text-[16px] md:text-[17px] leading-snug"
          >
            Comprar Vivabox
          </a>

        </div>

      </div>

    </section>
  );
}