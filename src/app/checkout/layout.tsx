// src/app/checkout/layout.tsx

import Navbar from "@/components/Navbar"
import BrandRibbon from "@/components/ui/BrandRibbon"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen vb-surface-base vb-checkout-white relative">

      <Navbar />

      <div className="pt-[72px]">
        <BrandRibbon />
        <main>
          {children}
        </main>
      </div>

    </div>
  )
}
