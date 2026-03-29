'use client'

import { use, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Facebook, Instagram } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useLanguage } from '@/contexts/language-context'
import { brands } from '@/lib/data'
import { useProducts } from '@/hooks/use-products'
import { notFound } from 'next/navigation'
import { useBrand } from '@/hooks/use-brand'

export default function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandSlug } = use(params)
  const { t } = useLanguage()
  const { products, loading } = useProducts()
  const { brand: remoteBrand, loading: brandLoading } = useBrand(brandSlug)
  
  const fallbackBrand = useMemo(() => brands.find(b => b.slug === brandSlug), [brandSlug])
  const brand = remoteBrand ?? fallbackBrand ?? null

  if (!brand && !brandLoading) {
    notFound()
  }
  
  const brandProducts = products.filter(p => p.brandSlug === brandSlug)
  const description = brand?.description ?? ''

  const SocialLink = ({
    href,
    label,
    children,
  }: {
    href?: string
    label: string
    children: React.ReactNode
  }) => {
    if (!href) return null
    return (
      <Link
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-sm font-medium text-slate-800 hover:bg-white transition"
      >
        {children}
        <span className="hidden sm:inline">{label}</span>
      </Link>
    )
  }

  const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16 5.5c1 .9 2.2 1.5 3.5 1.6v3.1c-1.3 0-2.6-.4-3.5-1v5.7c0 3-2.4 5.4-5.4 5.4S5.2 17 5.2 14c0-3 2.4-5.4 5.4-5.4.2 0 .4 0 .6.1v3.2c-.2-.1-.4-.1-.6-.1-1.2 0-2.1 1-2.1 2.2s1 2.1 2.2 2.1c1.2 0 2.1-1 2.1-2.2V3.9h3.4c.1.6.4 1.2.8 1.6l.2.1Z" />
    </svg>
  )
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Hero Banner */}
        <div className="relative h-64 md:h-80 bg-muted">
          <Image
            src={brand?.banner || '/placeholder.svg'}
            alt={brand?.name || 'Brand'}
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
                  src={brand?.logo || '/placeholder.svg'}
                  alt={`${brand?.name ?? 'Brand'} logo`}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-1">
                  {brand?.name ?? 'Marca'}
                </h1>
                <p className="text-white/80 text-sm md:text-base">{brandProducts.length} products</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <SocialLink href={brand?.facebook} label="Facebook">
                    <Facebook className="h-4 w-4" />
                  </SocialLink>
                  <SocialLink href={brand?.instagram} label="Instagram">
                    <Instagram className="h-4 w-4" />
                  </SocialLink>
                  <SocialLink href={brand?.tiktok} label="TikTok">
                    <TikTokIcon className="h-4 w-4" />
                  </SocialLink>
                </div>
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
            <span className="text-foreground">{brand?.name}</span>
          </nav>
          
          {/* Description */}
          <div className="max-w-3xl mb-12">
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
          
          {/* Products */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
              Productos
            </h2>
            
            {brandProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {brandProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                No hay productos disponibles de esta marca aún.
              </p>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
