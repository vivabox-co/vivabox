import Image from "next/image"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import WhatsappButton from "@/components/WhatsappButton"
import AliadosCard from "@/features/aliados/AliadosCard"

export const metadata = {
  title: "Ofrece tu experiencia | Vivabox Colombia",
  description:
    "¿Tienes una experiencia que vale la pena regalar? Propón tu experiencia a Vivabox y haz que más personas la descubran.",
}

// Misma imagen/tratamiento que /proximamente — no hay foto dedicada a
// aliados todavía. Cambiar solo este path cuando exista un asset propio.
const BACKGROUND_IMAGE = "/images/hero/experiencia-vivabox-aire-libre.webp"

export default function AliadosPage() {
  return (
    <>
      <Navbar />

      <main className="relative min-h-screen flex items-center justify-center px-6 py-28 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={BACKGROUND_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover scale-105 blur-md"
          />
          <div className="absolute inset-0 bg-ink/45" />
        </div>

        <section className="modal-glass relative z-10 w-full max-w-md rounded-[26px] px-6 py-10 sm:px-8 sm:py-12">
          <AliadosCard />
        </section>
      </main>

      <Footer />
      <WhatsappButton />
    </>
  )
}
