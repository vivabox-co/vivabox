import { boxes } from "@/data/boxes"
import { notFound } from "next/navigation"
import CheckoutStep from "@/app/checkout/components/CheckoutStep"
import CheckoutProgress from "../CheckoutProgress"

// Known slugs are allow-listed so Next.js's router rejects any other slug
// at the routing layer (real HTTP 404) instead of inside this async
// component — which streams under the root loading.tsx Suspense boundary
// and would otherwise flush a 200 shell before notFound() below is reached.
export async function generateStaticParams() {
  return boxes.map((box) => ({ slug: box.slug }))
}

export const dynamicParams = false

export default async function CheckoutPage({
  params,
}: {
  params: { slug: string }
}) {

  // Next 16 fix
  const { slug } = await Promise.resolve(params)

  if (!slug) {
    notFound()
  }

  const box = boxes.find((b) => b.slug === slug)

  if (!box) {
    notFound()
  }

  const checkoutBox = {
    slug: box.slug,
    name: box.name,
    price: box.price,
    image: box.image ?? "",
  }

  return (
    <>
      {/* Progress bar */}
      <CheckoutProgress current="elegir" />

      {/* Content */}
      <CheckoutStep box={checkoutBox} />
    </>
  )
}
