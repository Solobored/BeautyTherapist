'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { StoreProduct } from '@/lib/product-types'
import { isMissingShippingSchemaError } from '@/lib/products-compat'

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
    brandId: item.brand_id,
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
  }
}

const selectFields = `
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

const legacySelectFields = `
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

        let { data: row, error: pErr }: { data: any | null; error: any } = await supabase
          .from('products')
          .select(selectFields)
          .eq('id', id)
          .eq('status', 'active')
          .maybeSingle()

        if (pErr && isMissingShippingSchemaError(pErr)) {
          const legacyResult: { data: any | null; error: any } = await supabase
            .from('products')
            .select(legacySelectFields)
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

        const mapped = mapRow(row)
        setProduct(mapped)

        let { data: relatedRows, error: rErr }: { data: any[] | null; error: any } = await supabase
          .from('products')
          .select(selectFields)
          .eq('status', 'active')
          .eq('category', mapped.category)
          .neq('id', mapped.id)
          .order('created_at', { ascending: false })
          .limit(4)

        if (rErr && isMissingShippingSchemaError(rErr)) {
          const legacyRelated: { data: any[] | null; error: any } = await supabase
            .from('products')
            .select(legacySelectFields)
            .eq('status', 'active')
            .eq('category', mapped.category)
            .neq('id', mapped.id)
            .order('created_at', { ascending: false })
            .limit(4)
          relatedRows = legacyRelated.data
          rErr = legacyRelated.error
        }

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
