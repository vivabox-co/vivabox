import { boxes } from "@/data/boxes"
import { notFound } from "next/navigation"
import CheckoutStep from "@/app/checkout/components/CheckoutStep"
import CheckoutProgress from "../CheckoutProgress"

export default async function CheckoutPage({
  params,
}: {
  params: { slug: string }
}) {

  // Next 16 fix
  const { slug } = await Promise.resolve(params)

  if (!slug) {
    return <div>ERROR: slug undefined</div>
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
