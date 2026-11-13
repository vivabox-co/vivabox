import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappButton from "@/components/WhatsappButton";
import BrandRibbon from "@/components/ui/BrandRibbon";

import EmpresasHero from "@/sections/empresas/EmpresasHero";
import EmpresasQuickBenefits from "@/sections/empresas/EmpresasQuickBenefits";
import EmpresasBenefits from "@/sections/empresas/EmpresasBenefits";
import EmpresasCustomization from "@/sections/empresas/EmpresasCustomization";
import EmpresasUseCases from "@/sections/empresas/EmpresasUseCases";
import EmpresasHowItWorks from "@/sections/empresas/EmpresasHowItWorks";
import EmpresasFinalCTA from "@/sections/empresas/EmpresasFinalCTA";

export default function EmpresasPage() {
  return (
    <>
      <Navbar />

      <main>
        <EmpresasHero />
        <BrandRibbon />
        <EmpresasQuickBenefits />
        <EmpresasBenefits />
        <EmpresasCustomization />
        <EmpresasUseCases />
        <EmpresasHowItWorks />
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
