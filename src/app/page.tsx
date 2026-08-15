import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsappButton from "@/components/WhatsappButton";
import Hero from "../sections/hero/Hero";
import HeroGuideArrow from "@/components/ui/HeroGuideArrow";
import WhatsIncluded from "../sections/whats-included/WhatsIncluded";
import ExperiencesPreview from "../sections/experiences-preview/ExperiencesPreview";
import Occasions from "../sections/occasions/Occasions";
// import Testimonials from "../sections/testimonials/Testimonials"; // désactivé tant qu'on n'a pas de vrais avis clients
import FAQ from "../sections/faq/FAQ";
import FinalCTA from "../sections/final-cta/FinalCTA";

import BrandRibbon from "@/components/ui/BrandRibbon";
import { getFAQPageSchema } from "@/data/faqSchema";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getFAQPageSchema()) }}
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

        {/* Section avis clients désactivée en attendant les premières vraies ventes — Testimonials.tsx conservé pour réactivation future */}
        <section className="bg-surface py-16 md:py-20 flex items-center justify-center">
          <Image src="/icons/logo.webp" alt="Vivabox" width={56} height={56} />
        </section>

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