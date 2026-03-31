'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

export function HeroSection() {
  const { t } = useLanguage()
  
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
          {/* Seller CTA temporalmente oculto para pausar altas de marcas */}
          {/*
          <Button 
            asChild
            size="lg"
            variant="outline"
            className="px-8 rounded-full border-2"
          >
            <Link href="/seller/register">{t('hero.sellWithUs')}</Link>
          </Button>
          */}
        </div>
        
        {/* Featured brands */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Featured Brand</p>
          <span className="font-serif text-3xl md:text-4xl text-foreground">AngeBae</span>
        </div>
      </div>
    </section>
  )
}
