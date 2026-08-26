import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappButton from "@/components/WhatsappButton";

import StoryHero from "@/sections/story/StoryHero";
import StoryPhotoBand from "@/sections/story/StoryPhotoBand";
import StoryProblem from "@/sections/story/StoryProblem";
import StoryOrigin from "@/sections/story/StoryOrigin";
import StoryColombia from "@/sections/story/StoryColombia";
import StoryCriteria from "@/sections/story/StoryCriteria";
import StoryTeam from "@/sections/story/StoryTeam";
import StoryPrinciples from "@/sections/story/StoryPrinciples";
import StoryTimeline from "@/sections/story/StoryTimeline";
import StoryClosing from "@/sections/story/StoryClosing";

export const metadata: Metadata = {
  title: "Nuestra historia | Vivabox Colombia — Regalos de experiencias",
  description:
    "Conoce la historia de Vivabox, una empresa colombiana que selecciona experiencias para regalar y las hace fáciles de descubrir, elegir y reservar.",
  alternates: {
    canonical: "/nuestra-historia",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function StoryPage() {
  return (
    <>
      <Navbar />

      <main>
        <StoryHero />

        <StoryPhotoBand
          src="/images/hero/experiencia-vivabox-aire-libre.webp"
          alt="Una experiencia Vivabox vivida al aire libre"
          objectPosition="center 50%"
        />

        <StoryProblem />
        <StoryOrigin />

        <StoryPhotoBand
          src="/images/hero/regalo-caja-vivabox-entrega.webp"
          alt="Alguien regalando una Vivabox"
          objectPosition="center 35%"
        />

        <StoryColombia />
        <StoryCriteria />
        <StoryTeam />
        <StoryPrinciples />
        <StoryTimeline />
        <StoryClosing />
      </main>

      <Footer />
      <WhatsappButton />
    </>
  );
}
