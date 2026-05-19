import { supabaseServer } from '@/lib/supabase'
import { isMissingShippingSchemaError } from '@/lib/products-compat'
import {
  mapStorefrontProduct,
  storefrontLegacySelectFields,
  storefrontSelectFields,
  type StorefrontProductRecord,
} from '@/lib/storefront-product-map'

async function attachReviewStats(products: StorefrontProductRecord[]) {
  if (products.length === 0) return products

  const productIds = products.map((product) => product.id)
  const { data } = await supabaseServer
    .from('reviews')
    .select('product_id, rating')
    .in('product_id', productIds)

  const stats = new Map<string, { total: number; count: number }>()

  for (const row of data ?? []) {
    const productId = String((row as { product_id?: string }).product_id ?? '')
    const rating = Number((row as { rating?: number }).rating ?? 0)
    if (!productId) continue
    const current = stats.get(productId) ?? { total: 0, count: 0 }
    current.total += rating
    current.count += 1
    stats.set(productId, current)
  }

  return products.map((product) => {
    const stat = stats.get(product.id)
    if (!stat) return product
    return {
      ...product,
      rating: Number((stat.total / stat.count).toFixed(1)),
      reviewCount: stat.count,
    }
  })
}

async function runProductQuery<T>(
  queryBuilder: (selectFields: string) => Promise<{ data: T; error: unknown }>
) {
  let result = await queryBuilder(storefrontSelectFields)

  if (result.error && isMissingShippingSchemaError(result.error)) {
    result = await queryBuilder(storefrontLegacySelectFields)
  }

  return result
}

export async function getAllActiveProducts(): Promise<StorefrontProductRecord[]> {
  try {
    const { data, error } = await runProductQuery<any[] | null>((fields) =>
      supabaseServer.from('products').select(fields).eq('status', 'active').order('created_at', { ascending: false })
    )

    if (error || !data?.length) {
      return []
    }

    return await attachReviewStats(data.map((row) => mapStorefrontProduct(row)))
  } catch {
    return []
  }
}

export async function getActiveProductById(id: string): Promise<StorefrontProductRecord | null> {
  try {
    const { data, error } = await runProductQuery<any | null>((fields) =>
      supabaseServer.from('products').select(fields).eq('id', id).eq('status', 'active').maybeSingle()
    )

    if (error || !data) {
      return null
    }

    const [product] = await attachReviewStats([mapStorefrontProduct(data)])
    return product ?? null
  } catch {
    return null
  }
}

export async function getRelatedActiveProducts(product: StorefrontProductRecord, limit = 4) {
  try {
    const { data, error } = await runProductQuery<any[] | null>((fields) =>
      supabaseServer
        .from('products')
        .select(fields)
        .eq('status', 'active')
        .eq('category', product.category)
        .neq('id', product.id)
        .order('created_at', { ascending: false })
        .limit(limit)
    )

    if (error || !data?.length) {
      return []
    }

    return await attachReviewStats(data.map((row) => mapStorefrontProduct(row)))
  } catch {
    return []
  }
}
