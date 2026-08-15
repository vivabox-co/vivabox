import { notFound } from "next/navigation"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import WhatsappButton from "@/components/WhatsappButton"

import BoxHero from "@/sections/box/BoxHero"
import BoxWhyItWorks from "@/sections/box/BoxWhyItWorks"
import BoxExperienceExamples from "@/sections/box/BoxExperienceExamples"
import BoxFAQ from "@/sections/box/BoxFAQ"
import BoxFinalCTA from "@/sections/box/BoxFinalCTA"
import BoxStickyCTA from "@/sections/box/BoxStickyCTA"

import BrandRibbon from "@/components/ui/BrandRibbon"

import { boxes } from "@/data/boxes"

// Force per-request rendering so the "Ejemplos de experiencias" shuffle
// (Math.random() in src/services/experiences.ts) re-runs on every reload
// instead of being frozen into the statically cached HTML.
export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function BoxPage({ params }: PageProps) {

  const { slug } = await params

  const box = boxes.find((b) => b.slug === slug)

  if (!box) {
    notFound()
  }

  return (
    <>
      <Navbar />

      <main>

        {/* HERO */}

        <BoxHero
          name={box.name}
          price={box.price}
          experiences={box.experiences}
          image={box.image}
          slug={box.slug}
        />

        <BrandRibbon />

        <BoxWhyItWorks />

        <BoxExperienceExamples />

        <BrandRibbon />

        <BoxFAQ validityMonths={box.validityMonths} />

        <BoxFinalCTA price={box.price} slug={box.slug} />

        <BrandRibbon />

      </main>

      <BoxStickyCTA price={box.price} slug={box.slug} />

      <Footer />

      {/* Clears the mobile sticky CTA so it never covers the footer's last rows */}
      <div className="lg:hidden h-[76px] bg-ink" />

      <WhatsappButton />
    </>
  )
}
