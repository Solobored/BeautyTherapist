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
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-secondary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 text-center">
        <span className="inline-block font-accent text-xs uppercase tracking-[0.3em] text-accent mb-6">
          {t('hero.badge')}
        </span>
        
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-foreground mb-6 max-w-4xl mx-auto leading-tight text-balance">
          {t('hero.tagline')}
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          {t('hero.subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 rounded-full"
          >
            <Link href="/shop">{t('hero.shopNow')}</Link>
          </Button>
        </div>
        
        {/* Featured Brand Section */}
        {!loading && featuredBrand && (
          <div className="mt-16 pt-8 border-t border-border/50">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Featured Brand</p>
            
            <Link href={`/brands/${featuredBrand.slug}`} className="inline-block group">
              <div className="flex flex-col items-center gap-4 mb-4">
                {/* Logo */}
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-accent/30 group-hover:border-accent transition-colors bg-card">
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
                
                {/* Brand Info */}
                <div>
                  <h3 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                    {featuredBrand.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    {featuredBrand.description.substring(0, 100)}...
                  </p>
                </div>
              </div>
              
              <Button variant="outline" className="mt-4 rounded-full">
                Ver Tienda →
              </Button>
            </Link>
          </div>
        )}

        {loading && (
          <div className="mt-16 pt-8 border-t border-border/50 text-muted-foreground">
            Cargando marca destacada...
          </div>
        )}
      </div>
    </section>
  )
}
