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

export function useProductDetail(id: string) {
  const [product, setProduct] = useState<StoreProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        let { data: row, error: pErr }: { data: any | null; error: any } = await supabase
          .from('products')
          .select(storefrontSelectFields)
          .eq('id', id)
          .eq('status', 'active')
          .maybeSingle()

        if (pErr && isMissingShippingSchemaError(pErr)) {
          const legacyResult: { data: any | null; error: any } = await supabase
            .from('products')
            .select(storefrontLegacySelectFields)
            .eq('id', id)
            .eq('status', 'active')
            .maybeSingle()
          row = legacyResult.data
          pErr = legacyResult.error
        }

        if (cancelled) return

        if (pErr || !row) {
          setProduct(null)
          setRelatedProducts([])
          setError(pErr?.message || 'Producto no encontrado')
          return
        }

        const mapped = mapStorefrontProduct(row)

        let { data: relatedRows, error: rErr }: { data: any[] | null; error: any } = await supabase
          .from('products')
          .select(storefrontSelectFields)
          .eq('status', 'active')
          .eq('category', mapped.category)
          .neq('id', mapped.id)
          .order('created_at', { ascending: false })
          .limit(4)

        if (rErr && isMissingShippingSchemaError(rErr)) {
          const legacyRelated: { data: any[] | null; error: any } = await supabase
            .from('products')
            .select(storefrontLegacySelectFields)
            .eq('status', 'active')
            .eq('category', mapped.category)
            .neq('id', mapped.id)
            .order('created_at', { ascending: false })
            .limit(4)
          relatedRows = legacyRelated.data
          rErr = legacyRelated.error
        }

        if (cancelled) return

        const relatedMapped = rErr ? [] : (relatedRows ?? []).map((related) => mapStorefrontProduct(related))
        const productIds = [mapped.id, ...relatedMapped.map((related) => related.id)]
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

        const hydrateStats = <T extends StoreProduct>(entry: T): T => {
          const stat = stats.get(entry.id)
          return stat
            ? {
                ...entry,
                rating: Number((stat.total / stat.count).toFixed(1)),
                reviewCount: stat.count,
              }
            : entry
        }

        setProduct(hydrateStats(mapped))
        setRelatedProducts(relatedMapped.map(hydrateStats))
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error al cargar')
          setProduct(null)
          setRelatedProducts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [id])

  return { product, relatedProducts, loading, error }
}
