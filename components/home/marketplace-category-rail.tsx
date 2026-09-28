'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type StoreBubble = {
  id: string
  name: string
  slug: string
  logo: string
}

export function MarketplaceCategoryRail() {
  const [stores, setStores] = useState<StoreBubble[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('id, brand_name, brand_slug, logo_url')
          .eq('is_active', true)
          .order('brand_name', { ascending: true })

        if (brandsError) throw brandsError

        const ids = (brandsData ?? []).map((brand) => brand.id)
        let activeProductCounts: Record<string, number> = {}

        if (ids.length > 0) {
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('brand_id')
            .eq('status', 'active')
            .in('brand_id', ids)

          if (productsError) throw productsError

          for (const product of productsData ?? []) {
            const brandId = String(product.brand_id)
            activeProductCounts[brandId] = (activeProductCounts[brandId] ?? 0) + 1
          }
        }

        const mapped = (brandsData ?? [])
          .filter((brand) => (activeProductCounts[brand.id] ?? 0) > 0)
          .map((brand) => ({
            id: brand.id,
            name: brand.brand_name,
            slug: brand.brand_slug,
            logo: brand.logo_url || '/placeholder.svg',
          }))

        if (!cancelled) setStores(mapped)
      } catch (error) {
        console.error('Error loading stores for home rail:', error)
        if (!cancelled) setStores([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading || stores.length === 0) {
    return null
  }

  return (
    <section className="bg-background py-0 md:hidden">
      <nav aria-label="Tiendas destacadas" className="scrollbar-hide container mx-auto flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 md:justify-center md:gap-6 md:overflow-visible md:px-4">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/brands/${store.slug}`}
            className="snap-start flex min-w-18 shrink-0 flex-col items-center gap-1 text-center text-xs font-medium text-foreground transition-colors hover:text-accent"
          >
            <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary shadow-sm ring-1 ring-background">
              <Image
                src={store.logo}
                alt={store.name}
                fill
                sizes="64px"
                className="object-cover"
                onError={(event) => {
                  event.currentTarget.src = '/placeholder.svg'
                }}
              />
            </span>
            <span className="max-w-18 truncate text-[10px] leading-3 md:text-xs">{store.name}</span>
          </Link>
        ))}
      </nav>
    </section>
  )
}
