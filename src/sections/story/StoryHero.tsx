import BrandDots from "@/components/ui/BrandDots";

export default function StoryHero() {
  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 100% at 50% 0%, #fff9f4 0%, #fff4ec 55%, #ffe9d8 100%)",
      }}
    >

      <div className="max-w-[640px] mx-auto px-6 text-center">

        <BrandDots className="justify-center" />

        <p className="text-sm font-semibold tracking-[0.14em] uppercase text-muted mb-4">
          Nuestra historia
        </p>

        <h1 className="h1 mb-6 text-balance">
          Creemos que regalar debería ser más fácil.
        </h1>

        <p className="text-lg text-muted leading-relaxed max-w-[520px] mx-auto">
          Por eso creamos una nueva forma de regalar experiencias en Colombia:
          una caja que no decide por ti, sino que deja que la persona elija
          cómo quiere vivirla.
        </p>

      </div>

    </section>
  );
}
