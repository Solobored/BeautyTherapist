'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import { useLanguage } from '@/contexts/language-context'
import { products } from '@/lib/data'

type FilterType = 'all' | 'skincare' | 'makeup'

export function FeaturedProducts() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<FilterType>('all')
  
  const filteredProducts = filter === 'all' 
    ? products.slice(0, 8)
    : products.filter(p => p.category === filter).slice(0, 8)
  
  return (
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
