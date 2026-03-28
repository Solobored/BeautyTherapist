'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'
import type { StoreProduct } from '@/lib/product-types'
import { cn, formatClp } from '@/lib/utils'

interface ProductCardProps {
  product: StoreProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useLanguage()
  const { addItem } = useCart()
  const { user, isAuthenticated, userType, toggleWishlist, isInWishlist } = useAuth()
  
  const inWishlist = isInWishlist(product.id)
  
  const cardTitle = product.nameEs?.trim() || product.name
  const cardImage = product.images[0] || '/placeholder.svg'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: cardTitle,
      brand: product.brand,
      price: product.price,
      image: cardImage,
    })
  }
  
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAuthenticated && userType === 'buyer') {
      toggleWishlist(product.id)
    }
  }
  
  return (
    <Link href={`/shop/${product.id}`} className="group">
      <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          <Image
            src={cardImage}
            alt={cardTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Wishlist Button */}
          <button 
            className={cn(
              "absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-colors",
              inWishlist ? "text-pink-500" : "text-muted-foreground hover:text-accent"
            )}
            onClick={handleToggleWishlist}
          >
            <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
          </button>
          
          {/* Sale Badge */}
          {product.comparePrice != null && product.comparePrice > 0 && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
              Sale
            </span>
          )}
          
          {/* Low Stock Badge */}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="absolute bottom-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              Pocas unidades
            </span>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-accent font-medium uppercase tracking-wide mb-1">{product.brand}</p>
          <h3 className="font-medium text-foreground line-clamp-2 min-h-[2.5rem]">{cardTitle}</h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {product.rating > 0 && (
              <>
                <span className="text-sm text-muted-foreground">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
              </>
            )}
          </div>
          
          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold text-foreground">{formatClp(product.price)}</span>
            {product.comparePrice != null && product.comparePrice > 0 && (
              <span className="text-sm text-muted-foreground line-through">{formatClp(product.comparePrice)}</span>
            )}
          </div>
          
          {/* Add to Cart */}
          <Button 
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {product.stock === 0 
              ? 'Agotado'
              : t('featured.addToCart')}
          </Button>
        </div>
      </div>
    </Link>
  )
}
