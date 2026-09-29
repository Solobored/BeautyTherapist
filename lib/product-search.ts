import type { StoreProduct } from '@/lib/product-types'

type SearchableProduct = Pick<StoreProduct, 'name' | 'nameEs' | 'brand' | 'brandSlug' | 'skinTags'>

function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function matchesProductSearch(product: SearchableProduct, query: string) {
  const normalizedQuery = normalizeSearchValue(query)
  if (!normalizedQuery) return true

  return [product.name, product.nameEs, product.brand, product.brandSlug, ...(product.skinTags ?? [])]
    .some((value) => normalizeSearchValue(value).includes(normalizedQuery))
}