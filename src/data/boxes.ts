import type { LucideIcon } from "lucide-react"

import {
  Coffee,
  Sparkles,
  Mountain,
} from "lucide-react"

export type Vivabox = {
  slug: string
  name: string

  signatureColor: string

  price: number
  experiences: number

  validityMonths: number

  delivery: {
    physical: boolean
    digital: boolean
  }

  ribbon: {
    text: string
    color: string
  }

  examples: {
    label: string
    icon: LucideIcon
  }[]

  categories: string[]

  description: string

  image: string
}

export const boxes: Vivabox[] = [

  {
    slug: "vivabox",
    name: "Vivabox Esencia",

    signatureColor: "#ff8406",

    price: 195000,
    experiences: 20,

    validityMonths: 6,

    delivery: {
      physical: true,
      digital: true
    },

    ribbon: {
      text: "Super detalle",
      color: "#ff8406"
    },

    examples: [
      { label: "Brunch", icon: Coffee },
      { label: "Masajes", icon: Sparkles },
      { label: "Karting", icon: Mountain },
    ],

    categories: [
      "Gastronomía",
      "Bienestar",
      "Aventura",
      "Cultura",
      "Estancias"
    ],

    description:
      "Un regalo que deja elegir entre más de 20 experiencias en Bogotá y Cundinamarca.",

    image: "/images/box-includes/vivabox-caja-regalo.png",
  },

]