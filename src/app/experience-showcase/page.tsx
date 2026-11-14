import { getAllExperiences } from "@/services/experiences";
import ExperienceShowcase from "./ExperienceShowcase";

// Internal production tool: not linked from the site, not in the sitemap.
// Screen-recording source for Instagram carousel/video assets -- see
// ExperienceShowcase.tsx for the marquee + controls.
export const metadata = {
  title: "Vivabox — Experience showcase (herramienta interna)",
  robots: { index: false, follow: false },
};

export default async function ExperienceShowcasePage() {
  const experiences = await getAllExperiences();

  return <ExperienceShowcase experiences={experiences} />;
}
