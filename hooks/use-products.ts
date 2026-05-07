'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { StoreProduct } from '@/lib/product-types'
import { isMissingShippingSchemaError } from '@/lib/products-compat'

export type { StoreProduct as Product } from '@/lib/product-types'

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

export function useProducts() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const nextSelect = `
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
        const legacySelect = `
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

        let { data, error: qErr }: { data: any[] | null; error: any } = await supabase
          .from('products')
          .select(nextSelect)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (qErr && isMissingShippingSchemaError(qErr)) {
          const legacyResult: { data: any[] | null; error: any } = await supabase
            .from('products')
            .select(legacySelect)
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

        setProducts(data.map(mapRow))
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
