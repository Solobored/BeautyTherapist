'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { brands as fallbackBrands, type Brand } from '@/lib/data'

function mapBrand(row: any): Brand {
  return {
    id: row.id,
    name: row.brand_name,
    slug: row.brand_slug,
    description: row.description ?? '',
    logo: row.logo_url ?? '/placeholder.svg',
    banner: row.banner_url ?? '/placeholder.svg',
    facebook: row.facebook_url ?? undefined,
    instagram: row.instagram_url ?? undefined,
    tiktok: row.tiktok_url ?? undefined,
  }
}

export function useBrand(slug: string) {
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: qErr } = await supabase
          .from('brands')
          .select(
            'id, brand_name, brand_slug, description, logo_url, banner_url, facebook_url, instagram_url, tiktok_url'
          )
          .eq('brand_slug', slug)
          .maybeSingle()

        if (qErr) {
          throw qErr
        }

        if (!cancelled) {
          if (data) {
            setBrand(mapBrand(data))
          } else {
            const fallback = fallbackBrands.find((b) => b.slug === slug) ?? null
            setBrand(fallback)
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error al cargar la marca')
          const fallback = fallbackBrands.find((b) => b.slug === slug) ?? null
          setBrand(fallback)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  return { brand, loading, error }
}
