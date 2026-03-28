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
import { products, reviews } from '@/lib/data'
import { formatClp } from '@/lib/utils'
import { notFound } from 'next/navigation'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t } = useLanguage()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  
  const product = products.find(p => p.id === id)
  
  if (!product) {
    notFound()
  }
  
  const productReviews = reviews.filter(r => r.productId === product.id)
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
  
  const stockStatus = product.stock === 0 
    ? { label: t('product.outOfStock'), color: 'text-destructive' }
    : product.stock < 10 
    ? { label: `${t('product.lowStock')} (${product.stock} ${t('common.units')})`, color: 'text-amber-600' }
    : { label: `${t('product.inStock')} (${product.stock} ${t('common.units')})`, color: 'text-green-600' }
  
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.images[0]
      })
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">{t('nav.home')}</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-foreground transition-colors">{t('nav.shop')}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>
          
          {/* Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <Image
                  src={product.images[selectedImage]}
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden bg-muted transition-all ${
                        selectedImage === index ? 'ring-2 ring-accent' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div>
              <Link 
                href={`/brands/${product.brandSlug}`}
                className="inline-block text-accent font-medium uppercase tracking-wide text-sm mb-2 hover:underline"
              >
                {product.brand}
              </Link>
              
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} {t('product.reviews').toLowerCase()})
                </span>
              </div>
              
              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-semibold text-foreground">{formatClp(product.price)}</span>
                {product.comparePrice && (
                  <span className="text-xl text-muted-foreground line-through">{formatClp(product.comparePrice)}</span>
                )}
              </div>
              
              {/* Stock Status */}
              <p className={`text-sm font-medium mb-6 ${stockStatus.color}`}>
                {stockStatus.label}
              </p>
              
              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>
              
              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={product.stock === 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {t('product.addToCart')}
                </Button>
                
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Buy Now */}
              <Button 
                variant="outline" 
                className="w-full"
                asChild
                disabled={product.stock === 0}
              >
                <Link href="/checkout">{t('product.buyNow')}</Link>
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
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
                {t('product.reviews')} ({productReviews.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="pt-6">
              <p className="text-muted-foreground leading-relaxed max-w-3xl">{product.description}</p>
            </TabsContent>
            
            <TabsContent value="ingredients" className="pt-6">
              <p className="text-muted-foreground leading-relaxed max-w-3xl">{product.ingredients}</p>
            </TabsContent>
            
            <TabsContent value="how-to-use" className="pt-6">
              <p className="text-muted-foreground leading-relaxed max-w-3xl">{product.howToUse}</p>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-6">
              <ProductReviews
                productId={product.id}
                reviews={productReviews.map(r => ({
                  id: r.id,
                  productId: r.productId,
                  reviewerName: r.customerName,
                  rating: r.rating,
                  content: r.text,
                  date: r.date,
                  verifiedPurchase: true
                }))}
                averageRating={product.rating}
                totalReviews={product.reviewCount}
              />
            </TabsContent>
          </Tabs>
          
          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                {t('product.relatedProducts')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
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
