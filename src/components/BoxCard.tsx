import Link from "next/link"
import Image from "next/image"
import { Plus } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { formatPrice } from "@/utils/formatPrice"

type BoxCardProps = {
  box: {
    slug: string
    name: string
    description: string
    image: string
    price: number
    experiences: number
    examples: { label: string; icon: LucideIcon }[]
    ribbon?: {
      text: string
      color: string
    }
    highlight?: boolean
  }
}

export default function BoxCard({ box }: BoxCardProps) {

  const imageSize = box.highlight ? "w-[230px]" : "w-[250px]"

  const cardStyle = box.highlight
    ? "md:-mt-6 ring-2 ring-primary/25"
    : ""

  return (
    <div className="relative pt-16 text-center group">

      {/* IMAGE */}

      <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-10">
        <Image
          src={box.image}
          alt={box.name}
          width={700}
          height={700}
          sizes="(min-width: 768px) 250px, 40vw"
          className={`h-auto object-contain max-w-none drop-shadow-xl transition-transform duration-300 group-hover:scale-105 ${imageSize}`}
        />
      </div>

      {/* CARD */}

      <div
        className={`vb-card relative overflow-hidden p-8 pt-28 transition hover:-translate-y-2 ${cardStyle}`}
      >

        {/* DIAGONAL RIBBON */}

        {box.ribbon && (
          <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none">
            <div
  className="absolute bottom-7 right-[-30px] -rotate-45 text-white text-[11px] font-medium tracking-wide w-[140px] text-center py-1 shadow-[0_6px_14px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
  style={{ backgroundColor: box.ribbon.color }}
>
  {box.ribbon.text}
</div>
          </div>
        )}

        {/* TITLE */}

        <h3 className="text-[22px] font-semibold mb-1">
          {box.name}
        </h3>

        {/* PRICE */}

        <div className="text-[20px] font-semibold text-foreground mb-2">
          ${formatPrice(box.price)}
        </div>

        {/* EXPERIENCE COUNT */}

        <div className="text-[14px] text-primary font-medium mb-4">
          Más de {box.experiences} experiencias
        </div>

        {/* LABEL */}

        <div className="text-[12px] uppercase tracking-wide text-muted mb-3">
          Ejemplos de experiencias
        </div>

        {/* EXPERIENCE LIST */}

        <ul className="text-[14px] text-muted mb-5 space-y-2">

          {box.examples.map((item, index) => {
            const Icon = item.icon
            return (
              <li key={index} className="flex items-center justify-center gap-2">
                <Icon size={16} strokeWidth={1.5} className="text-primary" />
                {item.label}
              </li>
            )
          })}

          {/* MORE EXPERIENCES */}

          <li className="flex items-center justify-center gap-2 text-muted">
            <Plus size={16} strokeWidth={1.5} className="text-primary" />
            muchas más
          </li>

        </ul>

        {/* CTA */}

        <Link
          href={`/cajas/${box.slug}`}
          className="vb-btn-primary h-12 px-7 text-[15px]"
        >
          Descubrir
        </Link>

      </div>

    </div>
  )
}