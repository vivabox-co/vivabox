import type { Metadata } from "next"
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

// Known slugs are allow-listed so Next.js's router rejects any other slug
// at the routing layer (real HTTP 404) instead of inside this async
// component — which streams under the root loading.tsx Suspense boundary
// and would otherwise flush a 200 shell before notFound() below is reached.
export async function generateStaticParams() {
  return boxes.map((box) => ({ slug: box.slug }))
}

export const dynamicParams = false

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

// SEO metadata for each Vivabox product page.
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params

  const box = boxes.find((b) => b.slug === slug)

  if (!box) {
    return {
      title: "Vivabox Colombia | Página no encontrada",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${box.name} | Regalo de experiencias en Colombia`

  const description =
    `Descubre ${box.name}: un regalo que deja elegir entre ${box.experiences} experiencias en Bogotá y Cundinamarca. Una forma diferente de regalar.`

  return {
    title,
    description,

    alternates: {
      canonical: `https://www.vivabox.com.co/cajas/${box.slug}`,
    },

    openGraph: {
      title,
      description,
      url: `https://www.vivabox.com.co/cajas/${box.slug}`,
      siteName: "Vivabox Colombia",
      locale: "es_CO",
      type: "website",
      images: [
        {
          url: box.image,
          width: 1200,
          height: 630,
          alt: `${box.name} - Vivabox Colombia`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [box.image],
    },

    robots: {
      index: true,
      follow: true,
    },
  }
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