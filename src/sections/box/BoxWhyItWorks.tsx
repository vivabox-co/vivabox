import Image from "next/image"
import BrandDots from "@/components/ui/BrandDots"

const items = [
  {
    image: "/images/hero/hero2.jpg",
    title: "Siempre aciertas.",
    text: "No tienes que adivinar: la persona elige lo que más le emociona.",
  },
  {
    image: "/images/final-cta/persona-regalando-vivabox.png",
    title: "El regalo se vive dos veces.",
    text: "Primero al recibir la caja. Después al disfrutar la experiencia.",
  },
  {
    image: "/images/box-includes/vivabox-catalogo-experiencias.png",
    title: "La persona elige.",
    text: "No importa si prefiere la gastronomía, el bienestar o la aventura. Ella decide.",
  },
]

export default function BoxWhyItWorks() {
  return (
    <section className="bg-white py-10 md:py-14">

      <div className="max-w-[640px] mx-auto px-6">

        <BrandDots />

        <h2 className="h2 mb-4 md:mb-6">
          ¿Por qué funciona tan bien como regalo?
        </h2>

        <div>

          {items.map(({ image, title, text }, i) => (
            <div
              key={title}
              className={`vb-divider-top flex items-center gap-4 py-5 ${
                i === items.length - 1 ? "border-b border-border" : ""
              }`}
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
