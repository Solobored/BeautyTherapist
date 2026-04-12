'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { brands as fallbackBrands, type Brand } from '@/lib/data'
import { supabase } from '@/lib/supabase'

export function BrandsShowcase() {
  const { t } = useLanguage()
  const [brands, setBrands] = useState<Brand[]>(fallbackBrands)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('id, brand_name, brand_slug, description, logo_url, banner_url, facebook_url, instagram_url, tiktok_url')
          .eq('is_active', true)
          .limit(10)

        if (error) throw error

        if (!cancelled && data && data.length > 0) {
          const mappedBrands: Brand[] = data.map(b => ({
            id: b.id,
            name: b.brand_name,
            slug: b.brand_slug,
            description: b.description || '',
            logo: b.logo_url || '/placeholder.svg',
            banner: b.banner_url || '/placeholder.svg',
            facebook: b.facebook_url || undefined,
            instagram: b.instagram_url || undefined,
            tiktok: b.tiktok_url || undefined,
          }))
          setBrands(mappedBrands)
        }
      } catch (e) {
        console.error('Error loading brands:', e)
        // Fallback a datos locales si hay error
        setBrands(fallbackBrands)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])
  
  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block font-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
            Partners
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            {t('brands.title')}
          </h2>
        </div>
        
        {/* Brand Cards */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center text-muted-foreground">Cargando marcas...</div>
          ) : (
            brands.map((brand) => (
              <div 
                key={brand.id}
                className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border/50"
              >
                {/* Banner */}
                <div className="relative h-48 md:h-64 bg-muted">
                  <Image
                    src={brand.banner}
                    alt={brand.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Logo Overlay */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white bg-white">
                      <Image
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg'
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-white">{brand.name}</h3>
                      <p className="text-sm text-white/80">Premium Beauty Brand</p>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 md:p-8">
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {brand.description}
                  </p>
                  <Button 
                    asChild
                    className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full"
                  >
                    <Link href={`/brands/${brand.slug}`}>
                      {t('brands.viewStore')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
