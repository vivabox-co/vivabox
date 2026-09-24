import Image from "next/image";

// Same layout as the homepage FinalCTA (photo | text), with a corporate
// photo, message and a WhatsApp CTA instead of "Comprar".
export default function EmpresasFinalCTA() {
  return (
    <section className="bg-white overflow-hidden">

      <div className="max-w-[1200px] mx-auto grid grid-cols-2 items-stretch h-[480px] sm:h-[520px] md:h-[560px] lg:h-[620px]">

        {/* PHOTO */}

        <div className="relative w-full h-full">
          <Image
            src="/images/occasions/regalo-corporativo-vivabox-equipo.webp"
            alt="Equipo de trabajo mostrando una caja Vivabox en la oficina"
            fill
            sizes="(min-width: 1200px) 600px, 50vw"
            className="object-cover"
          />
        </div>

        {/* TEXT */}

        <div className="flex flex-col items-center justify-center px-4 sm:px-8 md:px-14 lg:px-20 text-center">

          <h2 className="text-ink text-[28px] sm:text-[34px] md:text-[46px] lg:text-[54px] font-semibold leading-[1.1] tracking-tight mb-5 md:mb-7">
            Agradecer.
            <br />
            Sorprender.
            <br />
            Fidelizar.
          </h2>

          <Image
            src="/icons/vivabox.webp"
            alt="Vivabox, caja de regalo de experiencias"
            width={170}
            height={43}
            className="mb-6 md:mb-8"
          />

          <p className="text-muted text-[13px] sm:text-[14px] mb-6 md:mb-8 max-w-[300px]">
            Cuéntanos cuántas personas quieres sorprender y te ayudamos.
          </p>

          <a
            href="https://wa.me/573142590291?text=Hola%2C%20me%20gustar%C3%ADa%20conocer%20las%20opciones%20de%20Vivabox%20para%20mi%20empresa."
            target="_blank"
            rel="noopener noreferrer"
            className="vb-btn-primary whitespace-nowrap px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 text-[15px] sm:text-[16px] md:text-[17px] leading-snug"
          >
            Hablar por WhatsApp
          </a>

        </div>

      </div>

    </section>
  );
}
