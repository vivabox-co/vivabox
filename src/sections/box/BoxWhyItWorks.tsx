import Image from "next/image"
import BrandDots from "@/components/ui/BrandDots"

const items = [
  {
    image: "/images/hero/experiencia-vivabox-aire-libre.webp",
    title: "Siempre aciertas.",
    text: "No tienes que adivinar: la persona elige lo que más le emociona.",
  },
  {
    image: "/images/final-cta/persona-regalando-vivabox.webp",
    title: "El regalo se vive dos veces.",
    text: "Primero al recibir la caja. Después al disfrutar la experiencia.",
  },
  {
    image: "/images/app-phone/vivabox-app-experiencias.webp",
    title: "La persona elige.",
    text: "No importa si prefiere la gastronomía, el bienestar o la aventura. Ella decide.",
  },
]

export default function BoxWhyItWorks() {
  return (
    <section className="bg-white py-10 md:py-14">

      <div className="max-w-[640px] md:max-w-[1040px] mx-auto px-6">

        <BrandDots />

        <h2 className="h2 mb-4 md:mb-6">
          ¿Por qué funciona tan bien como regalo?
        </h2>

        <div className="md:grid md:grid-cols-3 md:gap-x-10 md:border-t md:border-border md:pt-10">

          {items.map(({ image, title, text }, i) => (
            <div
              key={title}
              className={`vb-divider-top md:[&::before]:hidden flex items-center gap-4 py-5 md:flex-col md:items-center md:text-center md:py-0 ${
                i === items.length - 1 ? "border-b border-border md:border-b-0" : ""
              } ${i > 0 ? "md:border-l md:border-border md:pl-10" : ""}`}
            >

              <div className="shrink-0 relative w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] rounded-full overflow-hidden">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="88px"
                  className="object-cover"
                />
              </div>

              <div>
                <h3 className="h3 mb-1">
                  {title}
                </h3>

                <p className="text-muted text-[14px] leading-relaxed">
                  {text}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  )
}
