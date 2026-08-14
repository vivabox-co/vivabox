"use client"

import Image from "next/image"
import { useState } from "react"
import ExperienceModal from "@/components/ExperienceModal"
import type { Experience } from "@/types/experience"
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/data/categories"

const CARD_IMAGE_SIZES = "(min-width: 1280px) 220px, (min-width: 1024px) 280px, 260px"

export default function BoxExperienceExamplesGrid({
  experiences,
}: {
  experiences: Experience[]
}) {

  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)

  return (
    <>
      {/* SCROLL CONTAINER on mobile/tablet — grid from lg up, where horizontal scroll has no discoverable affordance with a mouse */}
      <div className="flex gap-4 overflow-x-auto pb-2 scroll-pl-4 no-scrollbar snap-x snap-mandatory scroll-smooth lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">

        {experiences.map((exp, index) => {

          const categoryKey = exp.category?.toLowerCase() || ""
          const categoryColor = CATEGORY_COLORS[categoryKey] || DEFAULT_CATEGORY_COLOR
          const badgeColor = `${categoryColor.bg} ${categoryColor.text}`
          const barColor = categoryColor.dot

          return (

            <div
              key={index}
              onClick={() => setSelectedExperience(exp)}
              className="vb-card group cursor-pointer snap-start min-w-[260px] lg:min-w-0 hover:-translate-y-[2px] transition-transform duration-300 overflow-hidden"
            >

              <div className="relative w-full h-[160px] overflow-hidden rounded-t-[26px]">

                <Image
                  src={exp.image || "/images/box-includes/vivabox-caja-regalo.png"}
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

                {exp.city && (
                  <p className="text-sm text-muted">
                    {exp.city}
                  </p>
                )}

              </div>

            </div>

          )
        })}

        {/* LAST CARD */}
        <div className="vb-card group snap-start min-w-[260px] lg:min-w-0 hover:-translate-y-[2px] transition-transform duration-300 overflow-hidden">

          <div className="relative w-full h-[160px] overflow-hidden rounded-t-[26px] bg-gradient-to-br from-[#fff4ec] to-[#f7f7f7] flex items-center justify-center">

            <Image
              src="/icons/logo.png"
              alt="Vivabox"
              width={82}
              height={82}
              className="opacity-100"
            />

            <div className="absolute left-0 top-0 bottom-0 w-[6px] flex flex-col z-10">
              {Object.values(CATEGORY_COLORS).map((c) => (
                <div key={c.dot} className={`flex-1 ${c.dot}`}></div>
              ))}
            </div>

          </div>

          <div className="p-4 text-center">

            <h3 className="font-semibold mb-1">
              Y muchas más por descubrir
            </h3>

            <p className="text-sm text-muted">
              Siempre estamos incorporando nuevas experiencias.
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
