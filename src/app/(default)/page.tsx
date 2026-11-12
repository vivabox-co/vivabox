import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappButton from "@/components/WhatsappButton";
import Hero from "@/sections/hero/Hero";
import HeroGuideArrow from "@/components/ui/HeroGuideArrow";
import WhatsIncluded from "@/sections/whats-included/WhatsIncluded";
import ExperiencesPreview from "@/sections/experiences-preview/ExperiencesPreview";
import Occasions from "@/sections/occasions/Occasions";
import Testimonials from "@/sections/testimonials/Testimonials";
import FAQ from "@/sections/faq/FAQ";
import FinalCTA from "@/sections/final-cta/FinalCTA";

import BrandRibbon from "@/components/ui/BrandRibbon";
import { getFAQPageSchema } from "@/data/faqSchema";
import { getOrganizationSchema } from "@/data/organizationSchema";

// Force per-request rendering so the "Ejemplos de experiencias" shuffle
// (Math.random() in src/services/experiences.ts) re-runs on every reload
// instead of being frozen into the statically cached HTML.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vivabox Colombia | El regalo que deja elegir",
  description:
    "Regala una Vivabox y deja que esa persona elija entre experiencias en Bogotá y Cundinamarca. Un regalo diferente, fácil de acertar.",
  alternates: {
    canonical: "https://www.vivabox.com.co",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getFAQPageSchema()),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOrganizationSchema()),
        }}
      />

      <Navbar />

      <main>
        <div className="relative">
          <Hero />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 max-w-[1200px] mx-auto">
            <HeroGuideArrow />
          </div>
        </div>

        <section id="incluye" className="scroll-mt-24">
          <WhatsIncluded />
        </section>

        <section id="experiencias" className="scroll-mt-24">
          <ExperiencesPreview />
        </section>

        <Occasions />

        <BrandRibbon />

        <Testimonials />

        <section id="faq" className="scroll-mt-24">
          <FAQ />
        </section>

        <BrandRibbon />

        <FinalCTA />
      </main>

      <Footer />
      <WhatsappButton />
    </>
  );
}