'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Plus, ShoppingBag, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'
import type { StoreProduct } from '@/lib/product-types'
import { cn, formatClp } from '@/lib/utils'

interface ProductCardProps {
  product: StoreProduct
  compact?: boolean
  layout?: 'grid' | 'horizontal'
  showAddToCart?: boolean
  showRating?: boolean
  showCartOverlay?: boolean
}

export function ProductCard({ product, compact = false, layout = 'grid', showAddToCart = true, showRating = true, showCartOverlay = false }: ProductCardProps) {
  const { t, language } = useLanguage()
  const { addItem } = useCart()
  const { user, isAuthenticated, userType, toggleWishlist, isInWishlist } = useAuth()

  const inWishlist = isInWishlist(product.id)

  const cardTitle = product.nameEs?.trim() || product.name
  const cardImage = product.images[0] || '/placeholder.svg'
  const horizontal = layout === 'horizontal'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: cardTitle,
      nameEs: cardTitle,
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
      <div className={cn(
        'overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 hover:shadow-md',
        compact && 'rounded-lg',
        horizontal && 'flex rounded-lg'
      )}>
        <div className={cn(
          'relative overflow-hidden bg-muted',
          horizontal ? 'w-[42%] min-h-40 shrink-0 sm:min-h-44' : 'aspect-square'
        )}>
          <Image
            src={cardImage}
            alt={cardTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 100vw"
          />

          {showCartOverlay && (
            <Button
              type="button"
              className="absolute bottom-3 right-3 z-10 size-11 rounded-full border border-border bg-card p-0 text-accent shadow-md hover:bg-card"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label={product.stock === 0
                ? language === 'en' ? 'Out of stock' : 'Agotado'
                : language === 'en' ? 'Add to cart' : 'Agregar al carrito'}
              title={product.stock === 0 ? 'Agotado' : t('featured.addToCart')}
            >
              <ShoppingCart className="size-5" />
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-card">
                <Plus className="size-3" />
              </span>
            </Button>
          )}

          {!horizontal && (
            <button
              className={cn(
                'absolute flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors',
                compact ? 'right-2 top-2 size-7' : 'right-3 top-3 size-8',
                inWishlist ? 'text-pink-500' : 'text-muted-foreground hover:text-accent'
              )}
              onClick={handleToggleWishlist}
              aria-label={inWishlist
                ? language === 'en' ? 'Remove from wishlist' : 'Quitar de favoritos'
                : language === 'en' ? 'Save to wishlist' : 'Guardar en favoritos'}
            >
              <Heart className={cn('h-4 w-4', inWishlist && 'fill-current')} />
            </button>
          )}

          {!horizontal && product.comparePrice != null && product.comparePrice > 0 && (
            <span className={cn('absolute left-3 top-3 rounded-full bg-accent font-medium text-accent-foreground', compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs')}>
              Sale
            </span>
          )}

          {!compact && !horizontal && product.stock > 0 && product.stock <= 5 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-orange-500 px-2 py-1 text-xs font-medium text-white">
              Pocas unidades
            </span>
          )}
          {compact && !showCartOverlay && (
            <Button
              type="button"
              className="absolute bottom-2 right-2 size-8 rounded-full bg-primary p-0 text-primary-foreground shadow-sm hover:bg-primary/90"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label={product.stock === 0
                ? language === 'en' ? 'Out of stock' : 'Agotado'
                : language === 'en' ? 'Add to cart' : 'Agregar al carrito'}
              title={product.stock === 0 ? 'Agotado' : t('featured.addToCart')}
            >
              <ShoppingBag className="size-4" />
            </Button>
          )}
        </div>

        <div className={cn('p-4', compact && 'p-1', horizontal && 'min-w-0 flex-1 p-3')}>
          {!compact && <p className="mb-1 text-xs font-medium uppercase tracking-wide text-accent">{product.brand}</p>}
          <div className={cn(horizontal && 'flex items-start justify-between gap-2')}>
            <h3 className={cn(
              'line-clamp-2 min-h-10 wrap-break-word font-medium text-foreground max-[844px]:line-clamp-none max-[844px]:whitespace-normal max-[844px]:wrap-break-word',
              compact ? 'min-h-8 text-sm leading-4' : 'text-[0.9rem] leading-5',
              horizontal && 'min-h-0 text-sm leading-5'
            )}>{cardTitle}</h3>
            {horizontal && (
              <button
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full transition-colors',
                  inWishlist ? 'text-pink-500' : 'text-muted-foreground hover:text-accent'
                )}
                onClick={handleToggleWishlist}
                aria-label={inWishlist
                  ? language === 'en' ? 'Remove from wishlist' : 'Quitar de favoritos'
                  : language === 'en' ? 'Save to wishlist' : 'Guardar en favoritos'}
              >
                <Heart className={cn('size-4', inWishlist && 'fill-current')} />
              </button>
            )}
          </div>

          <div className={cn('mt-2 flex items-center gap-1', (compact || !showRating) && 'hidden')}>
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {product.rating > 0 && (
              <>
                <span className="text-sm text-muted-foreground">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
              </>
            )}
          </div>

          <div className={cn('mt-2 flex items-center gap-2', compact && 'mt-1 flex-wrap gap-x-1.5 gap-y-0')}>
            <span className={cn('font-semibold text-foreground', compact && 'text-sm')}>{formatClp(product.price)}</span>
            {product.comparePrice != null && product.comparePrice > 0 && (
              <span className={cn('text-sm text-muted-foreground line-through', compact && 'text-[10px]')}>{formatClp(product.comparePrice)}</span>
            )}
          </div>

          {!compact && showAddToCart && (
            <Button
              className={cn('mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90', horizontal && 'mt-3 h-9')}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {product.stock === 0 ? 'Agotado' : t('featured.addToCart')}
            </Button>
          )}
        </div>
      </div>
    </Link>
  )
}
