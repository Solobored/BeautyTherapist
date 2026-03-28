'use client'

import { useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Minus, Plus, ShoppingBag, Heart, ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { ProductReviews } from '@/components/product-reviews'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/contexts/language-context'
import { useCart } from '@/contexts/cart-context'
import { useProductDetail } from '@/hooks/use-product-detail'
import { formatClp } from '@/lib/utils'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t } = useLanguage()
  const { addItem } = useCart()
  const { product, relatedProducts, loading, error } = useProductDetail(id)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const displayName = product?.nameEs?.trim() || product?.name || ''
  const displayDescription = product?.descriptionEs?.trim() || product?.description || ''
  const displayHowTo = product?.howToUseEs?.trim() || product?.howToUse || ''

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-background">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">
              Producto no encontrado
            </h1>
            <p className="text-muted-foreground mb-6">
              {error || 'Este producto no está disponible o el enlace no es válido.'}
            </p>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/shop">{t('nav.shop')}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const mainImage = product.images[selectedImage] || product.images[0] || '/placeholder.svg'

  const stockStatus =
    product.stock === 0
      ? { label: t('product.outOfStock'), color: 'text-destructive' }
      : product.stock < 10
        ? { label: `${t('product.lowStock')} (${product.stock} ${t('common.units')})`, color: 'text-amber-600' }
        : { label: `${t('product.inStock')} (${product.stock} ${t('common.units')})`, color: 'text-green-600' }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: displayName,
        brand: product.brand,
        price: product.price,
        image: product.images[0] || '/placeholder.svg',
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              {t('nav.home')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-foreground transition-colors">
              {t('nav.shop')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground line-clamp-1">{displayName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <Image
                  src={mainImage}
                  alt={displayName}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3 flex-wrap">
                  {product.images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden bg-muted transition-all ${
                        selectedImage === index ? 'ring-2 ring-accent' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${displayName} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Link
                href={`/brands/${product.brandSlug}`}
                className="inline-block text-accent font-medium uppercase tracking-wide text-sm mb-2 hover:underline"
              >
                {product.brand}
              </Link>

              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                {displayName}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(Math.max(product.rating, 0)) ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating > 0 ? (
                    <>
                      {product.rating} ({product.reviewCount} {t('product.reviews').toLowerCase()})
                    </>
                  ) : (
                    <span>Sin reseñas aún</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-semibold text-foreground">{formatClp(product.price)}</span>
                {product.comparePrice != null && product.comparePrice > 0 && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatClp(product.comparePrice)}
                  </span>
                )}
              </div>

              <p className={`text-sm font-medium mb-6 ${stockStatus.color}`}>{stockStatus.label}</p>

              <p className="text-muted-foreground leading-relaxed mb-6">{displayDescription}</p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={product.stock === 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {t('product.addToCart')}
                </Button>

                <Button variant="outline" size="icon" type="button">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" className="w-full" asChild disabled={product.stock === 0}>
                <Link href="/checkout">{t('product.buyNow')}</Link>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="description" className="mb-16">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
              >
                {t('product.description')}
              </TabsTrigger>
              <TabsTrigger
                value="ingredients"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
              >
                {t('product.ingredients')}
              </TabsTrigger>
              <TabsTrigger
                value="how-to-use"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
              >
                {t('product.howToUse')}
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
              >
                {t('product.reviews')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="pt-6">
              <p className="text-muted-foreground leading-relaxed max-w-3xl">{displayDescription}</p>
            </TabsContent>

            <TabsContent value="ingredients" className="pt-6">
              <p className="text-muted-foreground leading-relaxed max-w-3xl whitespace-pre-wrap">
                {product.ingredients || '—'}
              </p>
            </TabsContent>

            <TabsContent value="how-to-use" className="pt-6">
              <p className="text-muted-foreground leading-relaxed max-w-3xl whitespace-pre-wrap">
                {displayHowTo || '—'}
              </p>
            </TabsContent>

            <TabsContent value="reviews" className="pt-6">
              <ProductReviews
                productId={product.id}
                reviews={[]}
                averageRating={product.rating}
                totalReviews={product.reviewCount}
              />
            </TabsContent>
          </Tabs>

          {relatedProducts.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                {t('product.relatedProducts')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
