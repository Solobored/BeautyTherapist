'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { StoreProduct } from '@/lib/product-types'
import { isMissingShippingSchemaError } from '@/lib/products-compat'
import {
  mapStorefrontProduct,
  storefrontLegacySelectFields,
  storefrontSelectFields,
} from '@/lib/storefront-product-map'

export type { StoreProduct as Product } from '@/lib/product-types'

export function useProducts() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        let { data, error: qErr }: { data: any[] | null; error: any } = await supabase
          .from('products')
          .select(storefrontSelectFields)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (qErr && isMissingShippingSchemaError(qErr)) {
          const legacyResult: { data: any[] | null; error: any } = await supabase
            .from('products')
            .select(storefrontLegacySelectFields)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
          data = legacyResult.data
          qErr = legacyResult.error
        }

        if (qErr) {
          setError(qErr.message)
          setProducts([])
          return
        }

        if (!data?.length) {
          setProducts([])
          return
        }
        const mapped = data.map((row) => mapStorefrontProduct(row))
        const productIds = mapped.map((product) => product.id)
        const { data: reviewRows } = await supabase
          .from('reviews')
          .select('product_id, rating')
          .in('product_id', productIds)

        const stats = new Map<string, { total: number; count: number }>()
        for (const row of reviewRows ?? []) {
          const productId = String((row as { product_id?: string }).product_id ?? '')
          const rating = Number((row as { rating?: number }).rating ?? 0)
          if (!productId) continue
          const current = stats.get(productId) ?? { total: 0, count: 0 }
          current.total += rating
          current.count += 1
          stats.set(productId, current)
        }

        setProducts(
          mapped.map((product) => {
            const stat = stats.get(product.id)
            return stat
              ? {
                  ...product,
                  rating: Number((stat.total / stat.count).toFixed(1)),
                  reviewCount: stat.count,
                }
              : product
          })
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading, error }
}
