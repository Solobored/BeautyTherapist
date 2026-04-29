'use client'

import { use, useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Facebook, Instagram, Star } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Card, CardContent } from '@/components/ui/card'
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
  const brand = remoteBrand || fallbackBrand || null

  if (!brand && !brandLoading) {
    notFound()
  }
  
  const brandProducts = products.filter(p => p.brandSlug === brandSlug)
  const description = brand?.description ?? ''
  
  // Featured products
  const featuredProductIds = brand?.featuredProductIds ?? []
  const featuredProducts = featuredProductIds.length > 0
    ? brandProducts.filter(p => featuredProductIds.includes(p.id))
    : []
  const remainingProducts = featuredProductIds.length > 0
    ? brandProducts.filter(p => !featuredProductIds.includes(p.id))
    : brandProducts
  
  // Reviews carousel
  const customReviews = brand?.customReviews ?? []
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  
  useEffect(() => {
    if (customReviews.length <= 3) return
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % customReviews.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [customReviews.length])

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
          {brandLoading ? (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          ) : (
            <Image
              src={brand?.banner || '/placeholder.svg'}
              alt={brand?.name || 'Brand'}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Brand Info */}
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
            <div className="flex items-end gap-4">
              <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-4 border-white bg-white shrink-0">
                {brandLoading ? (
                  <div className="absolute inset-0 animate-pulse bg-muted" />
                ) : (
                  <Image
                    src={brand?.logo || '/placeholder.svg'}
                    alt={`${brand?.name ?? 'Brand'} logo`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80px, 96px"
                  />
                )}
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

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <section className="mb-12">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                Productos Destacados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                        Destacado
                      </span>
                    </div>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews Section */}
          {customReviews.length > 0 && (
            <section className="mb-12">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                Lo Que Dicen Nuestros Clientes
              </h2>
              {customReviews.length > 3 ? (
                <div className="relative">
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
                    >
                      {customReviews.map((review) => (
                        <div key={review.id} className="w-full flex-shrink-0 px-4">
                          <Card className="bg-secondary/50">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-lg font-medium mb-2">{review.customerName}</p>
                              <p className="text-muted-foreground italic">"{review.text}"</p>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {customReviews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentReviewIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentReviewIndex ? 'bg-accent' : 'bg-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customReviews.map((review) => (
                    <Card key={review.id} className="bg-secondary/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-lg font-medium mb-2">{review.customerName}</p>
                        <p className="text-muted-foreground italic">"{review.text}"</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}
          
          {/* Products */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
              Productos
            </h2>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-3" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : remainingProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {remainingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : featuredProducts.length === 0 && (
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
