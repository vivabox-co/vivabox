import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { getSupabase } from "@/services/supabase"
import ConfiguratorPreview from "@/features/empresas-configurator/ConfiguratorPreview"

// Private by design: the link is the only way in, and search engines skip it.
export const metadata: Metadata = {
  title: "Maqueta de tu Vivabox",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function MaquetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_RE.test(id)) notFound()

  const { data } = await getSupabase()
    .from("empresa_maquetas")
    .select("logo_thumb, message, signature, front_text, front_text_custom, logo_size, brand_color")
    .eq("id", id)
    .maybeSingle()

  if (!data) notFound()

  return (
    <>
      <Navbar />
      <main className="vb-dark bg-ink min-h-screen">
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 text-white">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.01em] text-center mb-3">
            Esta es tu maqueta
          </h1>
          <p className="text-white/70 text-center mb-10 max-w-[480px] mx-auto">
            Así se vería tu Vivabox. Gírala para verla por todos lados.
          </p>
          <ConfiguratorPreview
            config={{
              logoUrl: data.logo_thumb,
              message: data.message ?? "",
              signature: data.signature ?? "",
              frontTextId: data.front_text ?? 0,
              frontCustom: data.front_text_custom ?? "",
              logoSize: data.logo_size ?? 1,
              color: data.brand_color ?? "#C8102E",
            }}
          />
          <div className="mt-10 text-center">
            <a
              href="/empresas#personaliza"
              className="text-white/80 underline hover:text-white text-[15px]"
            >
              Crear otra maqueta
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
