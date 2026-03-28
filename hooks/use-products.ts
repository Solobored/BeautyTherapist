'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { StoreProduct } from '@/lib/product-types'

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

export function useProducts() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: qErr } = await supabase
          .from('products')
          .select(
            `
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
          )
          .eq('status', 'active')
          .order('created_at', { ascending: false })

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
