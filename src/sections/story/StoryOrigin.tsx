import Reveal from "@/components/ui/Reveal";

export default function StoryOrigin() {
  return (
    <section className="bg-accent-tint py-20 md:py-[120px]">

      <div className="max-w-[640px] mx-auto px-6">

        <Reveal duration={400}>
          <h2 className="h2 mb-8">
            Así nació Vivabox.
          </h2>
        </Reveal>

        <Reveal duration={400} delay={80}>
          <div>
            <p className="text-muted leading-relaxed mb-4">
              Una caja física que se convierte en una experiencia.
            </p>

            <p className="text-muted leading-relaxed mb-4">
              Quien regala elige la Vivabox. Quien la recibe descubre las
              experiencias disponibles y elige la que más le guste.
            </p>

            <p className="text-muted leading-relaxed mb-8">
              Después, nosotros nos encargamos de acompañar el proceso hasta
              la reserva.
            </p>

            <p className="text-xl md:text-2xl font-semibold text-ink leading-snug">
              Porque para nosotros el regalo no termina cuando entregas la
              caja.
              <br />
              Ahí empieza.
            </p>
          </div>
        </Reveal>

      </div>

    </section>
  );
}
