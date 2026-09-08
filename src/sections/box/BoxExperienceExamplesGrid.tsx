"use client"

import Image from "next/image"
import { useState } from "react"
import { Smartphone } from "lucide-react"
import ExperienceModal from "@/components/ExperienceModal"
import type { Experience } from "@/types/experience"
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR, formatCity } from "@/data/categories"

const CARD_IMAGE_SIZES = "(min-width: 1024px) 210px, 260px"

export default function BoxExperienceExamplesGrid({
  experiences,
}: {
  experiences: Experience[]
}) {

  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)

  return (
    <>
      {/* SCROLL CONTAINER at every breakpoint — the container clips the trailing card so part of it peeks in, signaling there's more to scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2 scroll-pl-4 no-scrollbar snap-x snap-mandatory scroll-smooth">

        {experiences.map((exp, index) => {

          const categoryKey = exp.category?.toLowerCase() || ""
          const categoryColor = CATEGORY_COLORS[categoryKey] || DEFAULT_CATEGORY_COLOR
          const badgeColor = `${categoryColor.bg} ${categoryColor.text}`
          const barColor = categoryColor.dot

          return (

            <div
              key={index}
              onClick={() => setSelectedExperience(exp)}
              className="vb-card group cursor-pointer snap-start min-w-[260px] lg:min-w-[210px] hover:-translate-y-[2px] transition-transform duration-300 overflow-hidden"
            >

              <div className="relative w-full h-[160px] overflow-hidden rounded-t-[26px]">

                <Image
                  src={exp.image || "/images/box-includes/vivabox-caja-regalo.webp"}
                  alt={exp.title}
                  fill
                  sizes={CARD_IMAGE_SIZES}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className={`absolute left-0 top-0 bottom-0 w-[6px] z-10 ${barColor}`} />

              </div>

              <div className="p-4">

                <span className={`inline-flex items-center leading-none text-xs font-medium px-2.5 py-1.5 rounded-full mb-2 capitalize ${badgeColor}`}>
                  {exp.category}
                </span>

                <h3 className="font-semibold mb-[2px]">
                  {exp.title}
                </h3>

                {formatCity(exp.city) && (
                  <p className="text-sm text-muted">
                    {formatCity(exp.city)}
                  </p>
                )}

              </div>

            </div>

          )
        })}

        {/* LAST CARD */}
        <div className="vb-card group snap-start min-w-[260px] lg:min-w-[210px] hover:-translate-y-[2px] transition-transform duration-300 overflow-hidden">

          <div className="relative w-full h-[160px] overflow-hidden rounded-t-[26px]">

            <Image
              src="/images/experiences-preview/vivabox-mapa-experiencias.webp"
              alt="Mapa de experiencias Vivabox"
              fill
              sizes={CARD_IMAGE_SIZES}
              className="object-cover"
            />

            <div className="absolute left-0 top-0 bottom-0 w-[6px] flex flex-col z-10">
              {Object.values(CATEGORY_COLORS).map((c) => (
                <div key={c.dot} className={`flex-1 ${c.dot}`}></div>
              ))}
            </div>

            <span className="absolute top-3 left-4 z-10 inline-flex items-center gap-1 leading-none text-xs font-medium px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-sm text-ink">
              <Smartphone size={13} strokeWidth={1.5} />
              En la app Vivabox
            </span>

          </div>

          <div className="p-4">

            <h3 className="font-semibold mb-1">
              Y muchas más por descubrir
            </h3>

            <p className="text-sm text-muted">
              Quien la reciba ve todo el catálogo, que seguimos ampliando.
            </p>

          </div>

        </div>

      </div>

      <ExperienceModal
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
      />
    </>
  )
}
