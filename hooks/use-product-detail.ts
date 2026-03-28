'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { StoreProduct } from '@/lib/product-types'

const PLACEHOLDER = '/placeholder.svg'

function mapRow(item: any): StoreProduct {
  const brand = Array.isArray(item.brands) ? item.brands[0] : item.brands
  const urls =
    item.product_images
      ?.sort((a: { position?: number }, b: { position?: number }) => (a.position || 0) - (b.position || 0))
      .map((img: { url: string }) => img.url)
      .filter(Boolean) || []
  return {
    id: item.id,
    name: item.name_en,
    nameEs: item.name_es,
    brand: brand?.brand_name || 'Marca',
    brandSlug: brand?.brand_slug || 'marca',
    category: item.category,
    price: Number(item.price),
    comparePrice: item.compare_at_price != null ? Number(item.compare_at_price) : undefined,
    description: item.description_en || '',
    descriptionEs: item.description_es || '',
    ingredients: item.ingredients || '',
    howToUse: item.how_to_use || '',
    howToUseEs: item.how_to_use || '',
    images: urls.length > 0 ? urls : [PLACEHOLDER],
    rating: 0,
    reviewCount: 0,
    stock: Number(item.stock ?? 0),
    status: item.status,
  }
}

const selectFields = `
  id,
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

        const { data: row, error: pErr } = await supabase
          .from('products')
          .select(selectFields)
          .eq('id', id)
          .eq('status', 'active')
          .maybeSingle()

        if (cancelled) return

        if (pErr || !row) {
          setProduct(null)
          setRelatedProducts([])
          setError(pErr?.message || 'Producto no encontrado')
          return
        }

        const mapped = mapRow(row)
        setProduct(mapped)

        const { data: relatedRows, error: rErr } = await supabase
          .from('products')
          .select(selectFields)
          .eq('status', 'active')
          .eq('category', mapped.category)
          .neq('id', mapped.id)
          .order('created_at', { ascending: false })
          .limit(4)

        if (cancelled) return

        if (rErr) {
          setRelatedProducts([])
        } else {
          setRelatedProducts((relatedRows ?? []).map(mapRow))
        }
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
