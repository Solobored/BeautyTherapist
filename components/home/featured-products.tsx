'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock3, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import { useLanguage } from '@/contexts/language-context'
import { useProducts } from '@/hooks/use-products'
import { supabase } from '@/lib/supabase'
import { formatClp } from '@/lib/utils'
import type { VideoItem } from '@/lib/video-types'
import type { BlogPostRecord } from '@/lib/blog-posts'

type StoreSpotlight = {
  id: string
  name: string
  slug: string
  logo: string
  products: Array<{ id: string; name: string; image: string; price: number; comparePrice?: number }>
}

export function FeaturedProducts() {
  const { t, language } = useLanguage()
  const isEnglish = language === 'en'
  const { products, loading } = useProducts()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPostRecord[]>([])
  const [spotlight, setSpotlight] = useState<StoreSpotlight | null>(null)
  const mobileDealsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const [{ data: videoRows }, { data: blogRows }, { data: brandRows }] = await Promise.all([
          supabase
            .from('seller_videos')
            .select('id, title, description, cloudinary_url, thumbnail_url, views_count, likes_count, duration_seconds, brand_id, featured_product_ids, brands (id, brand_name, logo_url)')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('blog_posts')
            .select('id, slug, title_es, title_en, content_es, content_en, cover_image, published_at, created_at, author, category')
            .order('published_at', { ascending: false, nullsFirst: false })
            .limit(3),
          supabase
            .from('brands')
            .select('id, brand_name, brand_slug, logo_url')
            .eq('brand_slug', 'angebae')
            .eq('is_active', true)
            .maybeSingle(),
        ])

        if (!cancelled) {
          const mappedVideos = (videoRows ?? []).map((video) => {
            const brand = Array.isArray(video.brands) ? video.brands[0] : video.brands
            return {
              id: video.id,
              title: video.title,
              description: video.description ?? undefined,
              cloudinaryUrl: video.cloudinary_url,
              thumbnailUrl: video.thumbnail_url ?? undefined,
              brandName: brand?.brand_name ?? 'BeautyTherapist',
              brandLogoUrl: brand?.logo_url ?? undefined,
              brandId: video.brand_id ?? brand?.id ?? '',
              featuredProducts: [],
              viewsCount: Number(video.views_count ?? 0),
              likesCount: Number(video.likes_count ?? 0),
              durationSeconds: Number(video.duration_seconds ?? 0),
            }
          })

          const mappedPosts = (blogRows ?? []).map((post) => ({
            id: post.id,
            slug: post.slug,
            title: post.title_es || post.title_en || 'Artículo',
            content: post.content_es || post.content_en || '',
            coverImage: post.cover_image || '/placeholder.svg',
            category: post.category || 'wellness',
            author: post.author || 'BeautyTherapist',
            publishedAt: post.published_at || post.created_at,
            createdAt: post.created_at,
            brandId: null,
            images: [{ id: post.id, url: post.cover_image || '/placeholder.svg', publicId: `${post.id}-cover`, altText: post.title_es || post.title_en || 'Blog', position: 0 }],
            products: [],
          }))

          setVideos(mappedVideos)
          setBlogPosts(mappedPosts)

          if (brandRows) {
            const brandProducts = products.filter((product) => product.brandSlug === brandRows.brand_slug).slice(0, 3)
            setSpotlight({
              id: brandRows.id,
              name: brandRows.brand_name,
              slug: brandRows.brand_slug,
              logo: brandRows.logo_url || '/placeholder.svg',
              products: brandProducts.map((product) => ({
                id: product.id,
                name: product.nameEs || product.name,
                image: product.images[0] || '/placeholder.svg',
                price: product.price,
                comparePrice: product.comparePrice,
              })),
            })
          }
        }
      } catch (error) {
        console.error('Error loading home feed data:', error)
        if (!cancelled) {
          setVideos([])
          setBlogPosts([])
          setSpotlight(null)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [products])

  const skincareOnlyProducts = products.filter((product) => product.category !== 'makeup')
  const filteredProducts = skincareOnlyProducts.slice(0, 8)
  const discountedProducts = skincareOnlyProducts
    .filter((product) => product.comparePrice != null && product.comparePrice > product.price)
    .slice(0, 8)
  const desktopDiscountedProducts = discountedProducts.slice(0, 3)
  const mobileDealSlides = discountedProducts.length > 1
    ? [...discountedProducts, discountedProducts[0]]
    : discountedProducts
  const firstGrid = filteredProducts.slice(0, 4)
  const secondGrid = filteredProducts.slice(4, 8)
  const extraMobileProducts = skincareOnlyProducts.slice(8, 16)
  const topVideo = videos[0]
  const topBlog = blogPosts[0]

  useEffect(() => {
    const carousel = mobileDealsRef.current
    if (!carousel || discountedProducts.length < 2) return

    let slideIndex = 0
    const interval = window.setInterval(() => {
      slideIndex += 1
      carousel.scrollTo({ left: slideIndex * carousel.clientWidth, behavior: 'smooth' })

      if (slideIndex === discountedProducts.length) {
        window.setTimeout(() => {
          if (!mobileDealsRef.current) return
          mobileDealsRef.current.scrollLeft = 0
          slideIndex = 0
        }, 550)
      }
    }, 3800)

    return () => window.clearInterval(interval)
  }, [discountedProducts.length])

  if (loading) {
    return (
      <section className="bg-background py-6 md:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-5 h-5 w-32 animate-pulse rounded-full bg-muted md:mb-12 md:mx-auto" />
          <div className="mb-4 h-10 w-full animate-pulse rounded-full bg-muted md:mx-auto md:w-105" />
          <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="bg-background py-8 md:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block font-accent text-xs uppercase tracking-[0.3em] text-accent">Collection</span>
            <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">{t('featured.title')}</h2>
          </div>
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">{t('products.noProducts')}</p>
            <p className="mt-2 text-sm text-muted-foreground">Coming soon...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-background py-2 pb-24 md:py-16 md:pb-0 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-1 text-left md:mb-12 md:text-center">
          <span className="mb-2 hidden font-accent text-[10px] uppercase tracking-[0.2em] text-accent md:mb-4 md:inline-block md:text-xs md:tracking-[0.3em]">Collection</span>
          <h2 className="font-serif text-base font-semibold text-foreground md:text-4xl">{t('featured.title')}</h2>
        </div>

        {discountedProducts.length > 0 && (
          <section className="mb-4 rounded-xl bg-secondary/70 p-2 sm:p-3 md:mb-10 md:p-4" aria-label="Ofertas">
            <div className="mb-2 flex items-center justify-between md:mb-2">
              <h3 className="text-base font-semibold text-foreground md:text-lg">{isEnglish ? 'Deals' : 'Ofertas'}</h3>
              <Link href="/shop" className="text-xs font-medium text-accent">{isEnglish ? 'View all' : 'Ver todo'}</Link>
            </div>
            <div ref={mobileDealsRef} className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto lg:hidden">
              {mobileDealSlides.map((product, index) => {
                const originalPrice = Number(product.comparePrice ?? 0)
                const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100)
                return (
                  <Link key={`${product.id}-${index}`} href={`/shop/${product.id}`} aria-hidden={index === discountedProducts.length ? 'true' : undefined} tabIndex={index === discountedProducts.length ? -1 : undefined} className="snap-start flex h-28 w-full min-w-full shrink-0 items-center gap-4 rounded-xl bg-card p-3 text-left sm:h-32 sm:gap-5 sm:p-4">
                    <span className="relative block size-22 shrink-0 overflow-hidden rounded-lg bg-secondary sm:size-26">
                      <Image src={product.images[0] || '/placeholder.svg'} alt={product.nameEs || product.name} fill sizes="(max-width: 1023px) 104px, 0px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">{product.nameEs || product.name}</span>
                      <span className="mt-1 inline-block rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">{discount}% OFF</span>
                      <span className="mt-1 flex flex-wrap items-baseline gap-x-2 leading-tight">
                        <span className="text-xs text-muted-foreground line-through sm:text-sm">{formatClp(originalPrice)}</span>
                        <span className="text-base font-bold text-foreground sm:text-lg">{formatClp(product.price)}</span>
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
            <div className="hidden snap-none grid-cols-3 gap-4 lg:grid">
              {desktopDiscountedProducts.map((product) => {
                const originalPrice = Number(product.comparePrice ?? 0)
                const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100)
                return (
                  <Link key={product.id} href={`/shop/${product.id}`} className="flex h-18 min-w-0 items-center gap-2 rounded-lg bg-card p-1.5 text-left">
                    <span className="relative block size-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                      <Image src={product.images[0] || '/placeholder.svg'} alt={product.nameEs || product.name} fill sizes="80px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-medium leading-[1.2] text-foreground">{product.nameEs || product.name}</span>
                      <span className="mt-0.5 inline-block bg-accent px-1 text-[9px] font-semibold text-accent-foreground">{discount}% OFF</span>
                      <span className="mt-0.5 flex flex-wrap items-baseline gap-x-1 leading-tight">
                        <span className="text-[9px] text-muted-foreground line-through">{formatClp(originalPrice)}</span>
                        <span className="text-xs font-bold text-foreground">{formatClp(product.price)}</span>
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {firstGrid.length > 0 && (
          <div className="home-product-grid mb-5 grid grid-cols-2 gap-2 md:mb-8 md:grid-cols-4 md:gap-4">
            {firstGrid.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        )}

        {topVideo && (
          <section className="mb-4 md:mb-8">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground md:text-lg">{isEnglish ? 'Videos' : 'Videos'}</h3>
              <Link href="/videos" className="text-[10px] font-medium text-accent md:text-xs">{isEnglish ? 'View all' : 'Ver todo'}</Link>
            </div>
            <div className="grid items-stretch gap-3 md:grid-cols-[1.2fr_0.8fr]">
              <Link href="/videos" className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <div className="relative aspect-[9/16] overflow-hidden bg-muted md:aspect-auto md:h-[420px] lg:h-[480px]">
                  <Image
                    src={topVideo.thumbnailUrl || '/placeholder.svg'}
                    alt={topVideo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 md:object-center"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                    <Play className="h-3 w-3 fill-current" />
                    {topVideo.viewsCount} views
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-end gap-2 text-white sm:bottom-3 sm:left-3 sm:right-3">
                    <div className="min-w-0 flex-1">
                      <p className="break-words whitespace-normal text-[13px] font-semibold leading-5 text-white [overflow-wrap:anywhere] sm:text-sm sm:leading-5 md:text-base md:leading-6">
                        {topVideo.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/80">{topVideo.brandName}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[9px] leading-none backdrop-blur-sm sm:text-[10px]">
                      <Clock3 className="h-3 w-3" />
                      {topVideo.durationSeconds ? `${Math.max(1, Math.round(topVideo.durationSeconds / 60))} min` : 'video'}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <div>
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-accent">Opiniones</p>
                  <div className="space-y-4">
                    <blockquote className="rounded-xl bg-secondary/60 p-3 text-sm leading-relaxed text-foreground">
                      “La rutina quedó mucho más suave, y el resultado se ve más uniforme. Me encantó la recomendación del suero.”
                    </blockquote>
                    <blockquote className="rounded-xl bg-secondary/60 p-3 text-sm leading-relaxed text-foreground">
                      “Los productos tienen buena formulación y no me irritaron. Lo volvería a comprar.”
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {topBlog && (
          <section className="mb-4 md:mb-8">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground md:text-lg">{isEnglish ? 'Blog' : 'Blog'}</h3>
              <Link href="/blog" className="text-[10px] font-medium text-accent md:text-xs">{isEnglish ? 'Read more' : 'Leer más'}</Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative h-28 w-full overflow-hidden rounded-xl bg-muted md:h-36 md:w-36">
                  <Image src={topBlog.coverImage || '/placeholder.svg'} alt={topBlog.title} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-accent">{topBlog.category}</p>
                  <h4 className="text-base font-semibold text-foreground md:text-xl">{topBlog.title}</h4>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{topBlog.content}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {secondGrid.length > 0 && (
          <div className="home-product-grid mt-5 grid grid-cols-2 gap-2 md:mt-8 md:grid-cols-4 md:gap-4">
            {secondGrid.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        )}

        {extraMobileProducts.length > 0 && (
          <div className="home-product-grid mt-5 grid grid-cols-2 gap-2 lg:hidden">
            {extraMobileProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
