import BrandDots from "@/components/ui/BrandDots";

export default function StoryHero() {
  return (
    <section className="bg-white py-28 md:py-40">

      <div className="max-w-[600px] mx-auto px-6 text-center">

        <BrandDots className="justify-center" />

        <p className="text-sm font-semibold tracking-[0.14em] uppercase text-muted mb-5">
          Nuestra historia
        </p>

        <h1 className="h1 mb-7 text-balance">
          Creemos que regalar
          <br />
          debería ser más fácil.
        </h1>

        <p className="text-lg text-muted leading-relaxed max-w-[480px] mx-auto">
          Por eso creamos una nueva forma de regalar experiencias en Colombia:
          una caja que no decide por ti, sino que deja que la persona elija
          cómo quiere vivirla.
        </p>

      </div>

    </section>
  );
}
