import { getSupabase } from "@/services/supabase";
import TestimonialsCarousel, {
  type Testimonial,
} from "./TestimonialsCarousel";

// "Camila Martínez Pérez" -> "Camila M."
function formatName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
}

async function getReviews(): Promise<Testimonial[]> {
  try {
    const { data, error } = await getSupabase()
      .from("google_reviews")
      .select("id, author_name, rating, text")
      .eq("is_visible", true)
      .gte("rating", 4)
      .order("review_date", { ascending: false });

    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id as string,
      name: formatName(r.author_name as string),
      rating: r.rating as number,
      text: r.text as string,
    }));
  } catch {
    // Sin Supabase configurado o tabla ausente: la sección simplemente no aparece.
    return [];
  }
}

export default async function Testimonials() {
  const reviews = await getReviews();
  if (reviews.length === 0) return null;
  return <TestimonialsCarousel reviews={reviews} />;
}
