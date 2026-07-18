import { client } from '@/sanity/lib/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MerchDesign = {
  _key: string
  name: string
  previewImage: {
    _type: 'image'
    asset?: {
      _type: 'reference'
      _ref: string
    }
    hotspot?: { x: number; y: number; height: number; width: number }
    crop?: { top: number; bottom: number; left: number; right: number }
    alt?: string
  }
  printifyVariantIds?: number[]
}

export type MerchColorOption = {
  _key: string
  label: string
  hex?: string
  printifyColorId?: string
}

export type MerchProduct = {
  _id: string
  _type: 'merchProduct'
  title: string
  slug: { current: string }
  description?: Array<{
    _type: string
    _key: string
    children?: Array<{ text?: string; _type: string; _key: string }>
    style?: string
  }>
  productType: 'tshirt' | 'hoodie' | 'beanie' | 'hat' | 'mug' | 'sticker' | 'joggers' | 'other'
  basePrice: number
  isFeatured: boolean
  status: 'active' | 'draft' | 'archived'
  availableSizes?: string[]
  designs?: MerchDesign[]
  colorOptions?: MerchColorOption[]
  printifyBlueprintId?: number
  printifyPrintProviderId?: number
  printifyProductId?: string
  fulfillmentProvider?: 'printify' | 'printful' | 'gelato' | 'manual'
  seoTitle?: string
  seoDescription?: string
}

// ─── Projection (shared between queries) ─────────────────────────────────────

const MERCH_PROJECTION = `
  _id,
  _type,
  title,
  slug,
  productType,
  basePrice,
  isFeatured,
  status,
  availableSizes,
  designs[]{
    _key,
    name,
    previewImage{
      asset,
      alt
    },
    printifyVariantIds
  },
  colorOptions[]{
    _key,
    label,
    hex,
    printifyColorId
  },
  fulfillmentProvider
`

// ─── Queries ──────────────────────────────────────────────────────────────────

/** All active merch products (for catalog page) */
export async function getMerchProducts(type?: string): Promise<MerchProduct[]> {
  const typeFilter = type ? `&& productType == $type` : ''
  const query = `*[_type == "merchProduct" && status == "active" ${typeFilter}] | order(isFeatured desc, _createdAt desc) {
    ${MERCH_PROJECTION}
  }`
  return client.fetch(query, type ? { type } : {})
}

/** Single merch product by slug (for detail page) */
export async function getMerchProductBySlug(slug: string): Promise<MerchProduct | null> {
  const query = `*[_type == "merchProduct" && slug.current == $slug && status == "active"][0] {
    ${MERCH_PROJECTION},
    description,
    seoTitle,
    seoDescription,
    printifyBlueprintId,
    printifyPrintProviderId,
    printifyProductId
  }`
  return client.fetch(query, { slug })
}

/** Featured merch products (for homepage section) */
export async function getFeaturedMerchProducts(): Promise<MerchProduct[]> {
  const query = `*[_type == "merchProduct" && status == "active" && isFeatured == true][0...4] {
    ${MERCH_PROJECTION}
  }`
  return client.fetch(query)
}

/** All unique product types that have active products (for filter tabs) */
export async function getMerchProductTypes(): Promise<string[]> {
  const query = `array::unique(*[_type == "merchProduct" && status == "active"].productType)`
  return client.fetch(query)
}
