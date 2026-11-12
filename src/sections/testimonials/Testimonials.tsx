import { getSupabase } from "@/services/supabase";
import TestimonialsCarousel, {
  type Testimonial,
} from "./TestimonialsCarousel";

// Ficha de Google Maps de Vivabox Colombia.
const GOOGLE_URL =
  "https://www.google.com/maps/place/Vivabox+Colombia/data=!4m8!3m7!1s0x8e3f999b98077ee5:0x877f1cb2c5b62e09!8m2!3d4.7824956!4d-73.970706!9m1!1b1!16s%2Fg%2F11nvgzsvzd";

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

async function getReviews(): Promise<{ items: Testimonial[]; average: string }> {
  try {
    const { data, error } = await getSupabase()
      .from("google_reviews")
      .select("id, author_name, rating, text, review_date")
      .eq("is_visible", true)
      .gte("rating", 4)
      .order("review_date", { ascending: false });

    if (error || !data || data.length === 0) return { items: [], average: "" };

    const avg =
      data.reduce((sum, r) => sum + (r.rating as number), 0) / data.length;

    return {
      average: avg.toFixed(1).replace(".", ","),
      items: data.map((r) => ({
        id: r.id as string,
        name: formatName(r.author_name as string),
        rating: r.rating as number,
        text: r.text as string,
        dateLabel: relativeDate(r.review_date as string | null),
      })),
    };
  } catch {
    // Sin Supabase configurado o tabla ausente: la sección simplemente no aparece.
    return { items: [], average: "" };
  }
}

export default async function Testimonials() {
  const { items, average } = await getReviews();
  if (items.length === 0) return null;
  return (
    <TestimonialsCarousel
      reviews={items}
      average={average}
      googleUrl={GOOGLE_URL}
    />
  );
}
