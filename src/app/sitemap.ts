import type { MetadataRoute } from "next"
import { boxes } from "@/data/boxes"

const BASE_URL = "https://www.vivabox.com.co"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      priority: 1,
      changeFrequency: "weekly",
    },
    {
      url: `${BASE_URL}/empresas`,
      priority: 0.8,
      changeFrequency: "monthly",
    },
    {
      url: `${BASE_URL}/nuestra-historia`,
      priority: 0.6,
      changeFrequency: "monthly",
    },
    {
      url: `${BASE_URL}/cambios-y-devoluciones`,
      priority: 0.3,
      changeFrequency: "yearly",
    },
    {
      url: `${BASE_URL}/politica-de-datos`,
      priority: 0.2,
      changeFrequency: "yearly",
    },
    {
      url: `${BASE_URL}/terminos-y-condiciones`,
      priority: 0.2,
      changeFrequency: "yearly",
    },
  ]

  const boxPages: MetadataRoute.Sitemap = boxes.map((box) => ({
    url: `${BASE_URL}/cajas/${box.slug}`,
    priority: 0.9,
    changeFrequency: "weekly",
  }))

  return [...staticPages, ...boxPages]
}