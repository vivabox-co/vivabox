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

// Las fechas de Google son relativas y aproximadas ("hace 1 mes").
function relativeDate(iso: string | null): string | null {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 0) return null;
  if (days < 7) return days <= 1 ? "Hace 1 día" : `Hace ${days} días`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return w === 1 ? "Hace 1 semana" : `Hace ${w} semanas`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30);
    return m === 1 ? "Hace 1 mes" : `Hace ${m} meses`;
  }
  const y = Math.floor(days / 365);
  return y === 1 ? "Hace 1 año" : `Hace ${y} años`;
}

async function getReviews(): Promise<Testimonial[]> {
  try {
    const { data, error } = await getSupabase()
      .from("google_reviews")
      .select("id, author_name, rating, text, review_date, source, source_url")
      .eq("is_visible", true)
      .gte("rating", 4)
      .order("review_date", { ascending: false });

    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id as string,
      name: formatName(r.author_name as string),
      rating: r.rating as number,
      text: r.text as string,
      dateLabel: relativeDate(r.review_date as string | null),
      source: (r.source as string) ?? "google",
      sourceUrl: (r.source_url as string | null) ?? null,
    }));
  } catch {
    // Sin Supabase configurado o tabla ausente: la sección simplemente no aparece.
    return [];
  }
}

export default async function Testimonials() {
  const items = await getReviews();
  if (items.length === 0) return null;
  return <TestimonialsCarousel reviews={items} />;
}
