'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import { useLanguage } from '@/contexts/language-context'
import { useProducts } from '@/hooks/use-products'

type FilterType = 'all' | 'skincare' | 'makeup'

export function FeaturedProducts() {
  const { t } = useLanguage()
  const { products, loading, isUsingMockData } = useProducts()
  const [filter, setFilter] = useState<FilterType>('all')
  
  const filteredProducts = filter === 'all' 
    ? products.slice(0, 8)
    : products.filter(p => p.category === filter).slice(0, 8)
  
  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block font-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
              Collection
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              {t('featured.title')}
            </h2>
          </div>
          
          {/* No Products Message */}
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{t('products.noProducts')}</p>
            <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
          </div>
        </div>
      </section>
    )
  }
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block font-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
            Collection
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            {t('featured.title')}
          </h2>
          {isUsingMockData && (
            <p className="text-xs text-amber-600 mt-2">{t('common.usingLocalData')}</p>
          )}
        </div>
        
        {/* Filter Chips */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-accent text-accent-foreground' : ''}
          >
            {t('featured.all')}
          </Button>
          <Button
            variant={filter === 'skincare' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('skincare')}
            className={filter === 'skincare' ? 'bg-accent text-accent-foreground' : ''}
          >
            {t('featured.skincare')}
          </Button>
          <Button
            variant={filter === 'makeup' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('makeup')}
            className={filter === 'makeup' ? 'bg-accent text-accent-foreground' : ''}
          >
            {t('featured.makeup')}
          </Button>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
