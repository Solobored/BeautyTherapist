'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useLanguage } from '@/contexts/language-context'
import { brands, products } from '@/lib/data'
import { notFound } from 'next/navigation'

export default function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = use(params)
  const { language, t } = useLanguage()
  
  const brand = brands.find(b => b.slug === brandSlug)
  
  if (!brand) {
    notFound()
  }
  
  const brandProducts = products.filter(p => p.brandSlug === brandSlug)
  const description = language === 'es' ? brand.descriptionEs : brand.description
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Hero Banner */}
        <div className="relative h-64 md:h-80 bg-muted">
          <Image
            src={brand.banner}
            alt={brand.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Brand Info */}
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
            <div className="flex items-end gap-4">
              <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-4 border-white bg-white shrink-0">
                <Image
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-1">
                  {brand.name}
                </h1>
                <p className="text-white/80 text-sm md:text-base">{brandProducts.length} products</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">{t('nav.home')}</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-foreground transition-colors">{t('nav.brands')}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{brand.name}</span>
          </nav>
          
          {/* Description */}
          <div className="max-w-3xl mb-12">
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
          
          {/* Products */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
              {language === 'es' ? 'Productos' : 'Products'}
            </h2>
            
            {brandProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {brandProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                No products available from this brand yet.
              </p>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
