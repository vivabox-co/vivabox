import Reveal from "@/components/ui/Reveal";
import BrandDots from "@/components/ui/BrandDots";

export default function StoryOrigin() {
  return (
    <section className="bg-white py-24 md:py-[140px]">

      <div className="max-w-[600px] mx-auto px-6">

        <Reveal duration={400}>
          <BrandDots />
          <h2 className="h2 mb-10">
            Así nació Vivabox.
          </h2>
        </Reveal>

        <Reveal duration={400} delay={80}>
          <div>
            <p className="text-muted leading-relaxed mb-4">
              Una caja física que se convierte en una experiencia. Quien
              regala elige la Vivabox; quien la recibe descubre las
              experiencias disponibles y elige la que más le guste.
            </p>

            <p className="text-muted leading-relaxed">
              Después, nosotros nos encargamos de acompañar el proceso hasta
              la reserva.
            </p>
          </div>
        </Reveal>

        <Reveal duration={400} delay={160}>
          <p className="max-w-[380px] text-xl md:text-[26px] font-semibold text-ink leading-snug mt-12 md:mt-16">
            Porque para nosotros el regalo no termina cuando entregas la
            caja. Ahí empieza.
          </p>
        </Reveal>

      </div>

    </section>
  );
}
