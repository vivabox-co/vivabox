"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  CATEGORY_COLORS,
  DEFAULT_CATEGORY_COLOR,
  CATEGORY_DESCRIPTIONS,
  DEFAULT_CATEGORY_DESCRIPTION,
  CATEGORY_WHY_VIVABOX,
  DEFAULT_WHY_VIVABOX,
  getExperienceHighlights,
  formatDuration,
} from "@/data/categories";

type Experience = {
  title: string
  city?: string
  category: string
  image?: string
  gallery?: string[]
  shortDescription?: string
  duration?: string
  ambiance?: string
  environment?: string
  engagement?: string
  vivanote?: string
}

type Props = {
  experience: Experience | null
  onClose: () => void
}

export default function ExperienceModal({ experience, onClose }: Props) {

  const scrollRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startScrollLeft: number; startIndex: number; dragging: boolean } | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)

  useEffect(() => {
    setPhotoIndex(0)
    scrollRef.current?.scrollTo({ left: 0 })
  }, [experience])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || !el.clientWidth || dragRef.current?.dragging) return
    setPhotoIndex(Math.round(el.scrollLeft / el.clientWidth))
  }, [])

  if (!experience) return null

  const categoryKey = experience.category?.toLowerCase() || ""

  const categoryColor = CATEGORY_COLORS[categoryKey] || DEFAULT_CATEGORY_COLOR

  const barColor = categoryColor.dot
  const badgeColor = `${categoryColor.bg} ${categoryColor.text}`

  const description = CATEGORY_DESCRIPTIONS[categoryKey] || DEFAULT_CATEGORY_DESCRIPTION
  const highlights = getExperienceHighlights(experience)
  const whyVivabox = experience.vivanote?.trim() || CATEGORY_WHY_VIVABOX[categoryKey] || DEFAULT_WHY_VIVABOX
  const duration = formatDuration(experience.duration)

  const images = experience.gallery?.length
    ? experience.gallery
    : [experience.image || "/images/box-includes/vivabox-caja-regalo.png"]

  const showNav = images.length > 1

  const goToPhoto = (i: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" })
  }

  const goToPrev = () => goToPhoto((photoIndex - 1 + images.length) % images.length)
  const goToNext = () => goToPhoto((photoIndex + 1) % images.length)

  const handlePointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current
    if (!el || !el.clientWidth) return
    dragRef.current = {
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      startIndex: Math.round(el.scrollLeft / el.clientWidth),
      dragging: true,
    }
    el.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const el = scrollRef.current
    const state = dragRef.current
    if (!el || !state?.dragging) return
    el.scrollLeft = state.startScrollLeft - (e.clientX - state.startX)
  }

  const handlePointerEnd = (e: React.PointerEvent) => {
    const el = scrollRef.current
    const state = dragRef.current
    if (!el || !state?.dragging) return
    dragRef.current = null

    const dx = e.clientX - state.startX
    const threshold = el.clientWidth * 0.15

    let target = state.startIndex
    if (dx <= -threshold) target = Math.min(state.startIndex + 1, images.length - 1)
    else if (dx >= threshold) target = Math.max(state.startIndex - 1, 0)

    goToPhoto(target)
  }

  return (

    <div
      onClick={onClose}
      className="vb-light fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-[26px] shadow-[0_20px_50px_rgba(0,0,0,0.35)] max-w-xl w-full overflow-hidden relative"
      >

        {/* close */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/45 text-white hover:bg-black/60 transition-colors"
        >
          <X size={16} strokeWidth={2} />
        </button>

        {/* image gallery — scrollable strip, 16:9 stable */}
        <div className="relative w-full aspect-video overflow-hidden">

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onDragStart={(e) => e.preventDefault()}
            className="flex h-full w-full overflow-x-auto no-scrollbar touch-pan-y select-none cursor-grab active:cursor-grabbing"
          >
            {images.map((src, i) => (
              <div key={i} className="relative h-full w-full shrink-0">
                <Image
                  src={src}
                  alt={`${experience.title} ${i + 1}`}
                  fill
                  sizes="(min-width: 576px) 576px, 100vw"
                  className="object-cover pointer-events-none"
                  priority={i === 0}
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* vertical category bar */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-[8px] z-10 pointer-events-none ${barColor}`}
          />

          {/* category badge */}
          <div className="absolute top-4 left-4 z-10">

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${badgeColor}`}
            >
              {experience.category}
            </span>

          </div>

          {showNav && (
            <>
              <button
                onClick={goToPrev}
                aria-label="Foto anterior"
                className="vb-icon-btn hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 p-1.5 z-20"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>

              <button
                onClick={goToNext}
                aria-label="Foto siguiente"
                className="vb-icon-btn hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 p-1.5 z-20"
              >
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPhoto(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === photoIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

        </div>

        {/* content */}
        <div className="p-5 sm:p-6">

          <h3 className="text-lg font-semibold mb-0.5">
            {experience.title}
          </h3>

          {/* PRACTICAL INFO — secondary, single line */}
          {(experience.city || duration) && (
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              {experience.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} strokeWidth={1.5} />
                  {experience.city}
                </span>
              )}
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock size={12} strokeWidth={1.5} />
                  {duration}
                </span>
              )}
            </div>
          )}

          {/* HIGHLIGHTS — unique to this experience, scannable at a glance */}
          <div className="flex flex-nowrap gap-1.5 mb-3">
            {highlights.map((highlight, i) => {
              const Icon = highlight.icon
              return (
                <span
                  key={i}
                  className="inline-flex min-w-0 items-center gap-1 rounded-full bg-surface px-2 py-1 text-[11px] font-medium text-ink whitespace-nowrap"
                >
                  <Icon size={12} className="text-primary shrink-0" strokeWidth={1.5} />
                  {highlight.label}
                </span>
              )
            })}
          </div>

          {/* EMOTIONAL SENTENCE */}
          <p className="text-sm text-gray-600 mb-3">
            {description}
          </p>

          {/* WHY VIVABOX — curated editorial block */}
          <div className="flex items-start gap-3 rounded-2xl bg-surface p-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-black/10">
              <Image src="/icons/logo.png" alt="" width={24} height={24} />
            </div>

            <div>
              <p className="text-xs font-semibold text-ink mb-0.5">
                Elegida por Vivabox
              </p>
              <p className="text-xs text-muted leading-snug">
                {whyVivabox}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}