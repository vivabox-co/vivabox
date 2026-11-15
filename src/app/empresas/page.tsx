import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappButton from "@/components/WhatsappButton";
import BrandRibbon from "@/components/ui/BrandRibbon";

import { getEmpresasFAQPageSchema } from "@/data/empresasFaq";
import EmpresasHero from "@/sections/empresas/EmpresasHero";
import EmpresasTrustStrip from "@/sections/empresas/EmpresasTrustStrip";
import EmpresasHowItWorks from "@/sections/empresas/EmpresasHowItWorks";
import EmpresasExamples from "@/sections/empresas/EmpresasExamples";
import EmpresasUseCases from "@/sections/empresas/EmpresasUseCases";
import EmpresasCustomization from "@/sections/empresas/EmpresasCustomization";
import EmpresasPricing from "@/sections/empresas/EmpresasPricing";
import EmpresasFAQ from "@/sections/empresas/EmpresasFAQ";
import EmpresasFinalCTA from "@/sections/empresas/EmpresasFinalCTA";

export default function EmpresasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getEmpresasFAQPageSchema()),
        }}
      />
      <Navbar />

      <main>
        <EmpresasHero />
        <BrandRibbon />
        <EmpresasHowItWorks />
        <EmpresasExamples />
        <EmpresasUseCases />
        <EmpresasCustomization />
        <EmpresasTrustStrip />
        <EmpresasPricing />
        <EmpresasFAQ />
        <EmpresasFinalCTA />

        {/*
          Empresas que confían en Vivabox — future social proof section.
          Not populated yet: no logos to show. Add here once available.
        */}
      </main>

      <Footer />
      <WhatsappButton social="linkedin" />
    </>
  );
}
