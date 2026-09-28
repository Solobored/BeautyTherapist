'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { supabase } from '@/lib/supabase'
import type { Brand } from '@/lib/data'

export function HeroSection() {
  const { t } = useLanguage()
  const [featuredBrand, setFeaturedBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('id, brand_name, brand_slug, description, logo_url, banner_url')
          .eq('brand_slug', 'angebae')
          .eq('is_active', true)
          .maybeSingle()

        if (error) throw error

        if (!cancelled && data) {
          setFeaturedBrand({
            id: data.id,
            name: data.brand_name,
            slug: data.brand_slug,
            description: data.description || '',
            logo: data.logo_url || '/placeholder.svg',
            banner: data.banner_url || '/placeholder.svg',
          })
        }
      } catch (e) {
        console.error('Error loading featured brand:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative mx-3 mt-2 flex min-h-0 items-center justify-center overflow-hidden rounded-2xl md:mx-0 md:mt-0 md:rounded-none md:min-h-[70vh]">
      <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-background to-secondary" />
      <div className="absolute inset-0 hidden bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent sm:block" />

      <div className="absolute top-20 left-10 hidden h-64 w-64 rounded-full bg-primary/20 blur-3xl md:block" />
      <div className="absolute bottom-20 right-10 hidden h-96 w-96 rounded-full bg-accent/10 blur-3xl md:block" />

      <div className="relative container mx-auto px-3 py-2 text-left sm:py-10 md:px-4 md:py-20 md:text-center">
        <span className="mb-1 inline-block font-accent text-[10px] uppercase tracking-[0.14em] text-accent sm:text-xs md:mb-6 md:tracking-[0.3em]">
          {t('hero.badge')}
        </span>

        <h1 className="mx-auto mb-1 max-w-4xl break-words font-serif text-xl font-semibold leading-tight text-foreground [overflow-wrap:anywhere] text-balance sm:text-3xl md:mb-6 md:max-w-5xl md:text-5xl lg:text-6xl xl:text-7xl">
          {t('hero.tagline')}
        </h1>

        <p className="mx-auto mb-2 max-w-2xl break-words text-xs leading-relaxed text-muted-foreground [overflow-wrap:anywhere] sm:text-base max-[844px]:max-w-4xl max-[844px]:whitespace-normal max-[844px]:break-words md:mb-10 md:max-w-3xl md:text-lg">
          {t('hero.subtitle')}
        </p>

        <div className="hidden flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-start md:flex md:justify-center md:gap-4">
          <Button
            asChild
            size="lg"
            className="h-10 rounded-full bg-accent px-5 text-sm text-accent-foreground hover:bg-accent/90 md:h-12 md:px-8 md:text-base"
          >
            <Link href="/shop">{t('hero.shopNow')}</Link>
          </Button>
        </div>

        {!loading && featuredBrand && (
          <div className="mt-6 hidden border-t border-border/50 pt-4 md:mt-16 md:block md:pt-8">
            <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground md:mb-6 md:text-xs">Featured Brand</p>

            <Link href={`/brands/${featuredBrand.slug}`} className="group inline-block">
              <div className="mb-2 flex flex-row items-center gap-3 text-left md:mb-4 md:flex-col md:gap-4 md:text-center">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-accent/30 bg-card transition-colors group-hover:border-accent md:h-20 md:w-20">
                  <Image
                    src={featuredBrand.logo}
                    alt={featuredBrand.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg'
                    }}
                  />
                </div>

                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground md:text-4xl">
                    {featuredBrand.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 max-w-md text-xs text-muted-foreground md:mx-auto md:mt-2 md:text-sm">
                    {featuredBrand.description.substring(0, 100)}...
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="mt-2 rounded-full md:mt-4 md:h-10 md:px-4">
                Ver Tienda →
              </Button>
            </Link>
          </div>
        )}

        {loading && (
          <div className="mt-6 hidden border-t border-border/50 pt-4 md:mt-16 md:block md:pt-8">
            <div className="mx-auto flex max-w-xl items-center justify-center gap-4 rounded-2xl border border-border/50 bg-card/60 p-4 md:flex-col md:gap-3">
              <div className="h-14 w-14 animate-pulse rounded-full bg-muted md:h-20 md:w-20" />
              <div className="flex-1 space-y-2 md:w-full">
                <div className="h-4 w-32 animate-pulse rounded-full bg-muted md:mx-auto" />
                <div className="h-6 w-40 animate-pulse rounded-full bg-muted md:mx-auto" />
                <div className="h-8 w-32 animate-pulse rounded-full bg-muted md:mx-auto" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
