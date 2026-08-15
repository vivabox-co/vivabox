import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappButton from "@/components/WhatsappButton";

import StoryHero from "@/sections/story/StoryHero";
import StoryPhotoBand from "@/sections/story/StoryPhotoBand";
import StoryWhy from "@/sections/story/StoryWhy";
import StoryIdea from "@/sections/story/StoryIdea";
import StoryTeam from "@/sections/story/StoryTeam";
import StoryValues from "@/sections/story/StoryValues";
import StoryCommitments from "@/sections/story/StoryCommitments";
import StoryPromise from "@/sections/story/StoryPromise";
import StoryThanks from "@/sections/story/StoryThanks";
import StoryCTA from "@/sections/story/StoryCTA";

export default function StoryPage() {
  return (
    <>
      <Navbar />

      <main>
        <StoryHero />

        <StoryPhotoBand
          src="/images/hero/hero2.webp"
          alt="Una experiencia Vivabox vivida al aire libre"
          objectPosition="center 30%"
        />

        <StoryWhy />
        <StoryIdea />

        <StoryPhotoBand
          src="/images/hero/hero.webp"
          alt="Alguien regalando una Vivabox"
          objectPosition="center 35%"
        />

        <StoryValues />
        <StoryTeam />
        <StoryCommitments />
        <StoryPromise />
        <StoryThanks />
        <StoryCTA />
      </main>

      <Footer />
      <WhatsappButton />
    </>
  );
}
