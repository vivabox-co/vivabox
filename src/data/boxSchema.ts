import type { Vivabox } from "@/data/boxes"

const SITE = "https://www.vivabox.com.co"

// Compact, SEO-only view of a sheet row. Built from the same sheet as the
// visible cards, so a new row shows up here automatically (within the
// sheet cache window) with no code change.
export type ExperienceSchemaItem = {
  title: string
  city?: string
  categoryLabel: string
  description?: string
}

const ITEM_LIST_NAME = "Ejemplos de experiencias que se pueden elegir con una Vivabox"

function toListItems(items: ExperienceSchemaItem[]) {
  return items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.city ? `${item.title} en ${item.city}` : item.title,
    description: [item.categoryLabel, item.description].filter(Boolean).join(". "),
  }))
}

// Homepage: the full, stable list of examples (the visible grid is a random
// 2-per-category sample, so crawlers would otherwise see a different slice
// on every visit).
export function getExperienceItemListSchema(items: ExperienceSchemaItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: ITEM_LIST_NAME,
    numberOfItems: items.length,
    itemListElement: toListItems(items),
  }
}

// Box page: the product (price, delivery, validity) plus the same list of
// examples attached to it. Experiences stay "examples", never a guarantee.
export function getBoxProductSchema(box: Vivabox, items: ExperienceSchemaItem[]) {
  const url = `${SITE}/cajas/${box.slug}`

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: `${box.name} - caja de regalo de experiencias`,
        description: `${box.description} Válida ${box.validityMonths} meses, en caja física o digital.`,
        image: `${SITE}${box.image}`,
        url,
        brand: { "@id": `${SITE}/#organization` },
        category: "Cajas de regalo de experiencias",
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "COP",
          price: box.price,
          availability: "https://schema.org/InStock",
          seller: { "@id": `${SITE}/#organization` },
        },
        subjectOf: { "@id": `${url}#examples` },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#examples`,
        name: ITEM_LIST_NAME,
        numberOfItems: items.length,
        itemListElement: toListItems(items),
      },
    ],
  }
}
