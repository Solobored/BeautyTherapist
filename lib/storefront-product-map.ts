import type { StoreProduct } from '@/lib/product-types'

const PLACEHOLDER = '/placeholder.svg'

export const storefrontSelectFields = `
  id,
  brand_id,
  name_en,
  name_es,
  description_en,
  description_es,
  ingredients,
  how_to_use,
  price,
  compare_at_price,
  stock,
  category,
  status,
  shipping_mode,
  updated_at,
  product_images (
    url,
    position,
    is_primary
  ),
  product_shipping_groups (
    shipping_group_id
  ),
  brands (
    brand_name,
    brand_slug
  )
`

export const storefrontLegacySelectFields = `
  id,
  brand_id,
  name_en,
  name_es,
  description_en,
  description_es,
  ingredients,
  how_to_use,
  price,
  compare_at_price,
  stock,
  category,
  status,
  updated_at,
  product_images (
    url,
    position,
    is_primary
  ),
  brands (
    brand_name,
    brand_slug
  )
`

type ProductRow = {
  id: string
  brand_id?: string | null
  name_en?: string | null
  name_es?: string | null
  description_en?: string | null
  description_es?: string | null
  ingredients?: string | null
  how_to_use?: string | null
  price: number | string
  compare_at_price?: number | string | null
  stock?: number | string | null
  category: string
  status: 'active' | 'draft' | 'inactive'
  shipping_mode?: 'blue_express' | 'chile_express' | 'custom_group' | null
  updated_at?: string | null
  product_images?: Array<{ url: string; position?: number | null; is_primary?: boolean | null }>
  product_shipping_groups?: Array<{ shipping_group_id?: string | null }>
  brands?:
    | {
        brand_name?: string | null
        brand_slug?: string | null
      }
    | Array<{
        brand_name?: string | null
        brand_slug?: string | null
      }>
    | null
}

export type StorefrontProductRecord = StoreProduct & {
  updatedAt: string | null
}

export function mapStorefrontProduct(item: ProductRow): StorefrontProductRecord {
  const brand = Array.isArray(item.brands) ? item.brands[0] : item.brands
  const urls =
    item.product_images
      ?.sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((img) => img.url)
      .filter(Boolean) || []

  return {
    id: item.id,
    brandId: item.brand_id ?? undefined,
    name: item.name_en || item.name_es || 'Product',
    nameEs: item.name_es || item.name_en || 'Producto',
    brand: brand?.brand_name || 'Marca',
    brandSlug: brand?.brand_slug || 'marca',
    category: item.category,
    price: Number(item.price),
    comparePrice: item.compare_at_price != null ? Number(item.compare_at_price) : undefined,
    description: item.description_en || item.description_es || '',
    descriptionEs: item.description_es || item.description_en || '',
    ingredients: item.ingredients || '',
    howToUse: item.how_to_use || '',
    howToUseEs: item.how_to_use || '',
    images: urls.length > 0 ? urls : [PLACEHOLDER],
    imageUrl: urls[0] || PLACEHOLDER,
    rating: 0,
    reviewCount: 0,
    stock: Number(item.stock ?? 0),
    status: item.status,
    shippingMode:
      item.shipping_mode === 'chile_express' || item.shipping_mode === 'custom_group'
        ? item.shipping_mode
        : 'blue_express',
    shippingGroupId: item.product_shipping_groups?.[0]?.shipping_group_id ?? null,
    updatedAt: item.updated_at ?? null,
  }
}
