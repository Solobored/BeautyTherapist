'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { brands } from '@/lib/data'

export function BrandsShowcase() {
  const { t } = useLanguage()
  
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
          {brands.map((brand) => (
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
          ))}
        </div>
      </div>
    </section>
  )
}
