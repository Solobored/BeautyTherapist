'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, Star, X } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { useLanguage } from '@/contexts/language-context'
import { useProducts } from '@/hooks/use-products'
import { formatClp } from '@/lib/utils'

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular'

export default function ShopPage() {
  const { t } = useLanguage()
  const { products, loading, error: productsError } = useProducts()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 200_000])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  
  const filteredProducts = useMemo(() => {
    let result = [...products]
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.nameEs && p.nameEs.toLowerCase().includes(query)) ||
        p.brand.toLowerCase().includes(query)
      )
    }
    
    // Category
    if (selectedCategory.length > 0) {
      result = result.filter(p => selectedCategory.includes(p.category))
    }
    
    // Brand
    if (selectedBrand.length > 0) {
      result = result.filter(p => selectedBrand.includes(p.brand))
    }
    
    // Price Range
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    
    // Rating
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating)
    }
    
    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'popular':
        result.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      default: // newest - by id desc
        result.sort((a, b) => parseInt(b.id) - parseInt(a.id))
    }
    
    return result
  }, [products, searchQuery, selectedCategory, selectedBrand, priceRange, minRating, sortBy])
  
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory([])
    setSelectedBrand([])
    setPriceRange([0, 200_000])
    setMinRating(0)
    setSortBy('newest')
  }
  
  const hasActiveFilters =
    searchQuery ||
    selectedCategory.length > 0 ||
    selectedBrand.length > 0 ||
    minRating > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 200_000
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">{t('shop.title')}</h1>
            <p className="text-muted-foreground">{filteredProducts.length} products</p>
          </div>

          {productsError && (
            <p className="mb-6 text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              {t('common.error')}: {productsError}
            </p>
          )}
          
          {/* Search and Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('shop.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {t('shop.filters')}
              </Button>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('shop.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('shop.newest')}</SelectItem>
                  <SelectItem value="price-low">{t('shop.priceLowHigh')}</SelectItem>
                  <SelectItem value="price-high">{t('shop.priceHighLow')}</SelectItem>
                  <SelectItem value="popular">{t('shop.mostPopular')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside className={`
              ${showFilters ? 'fixed inset-0 z-50 bg-background p-6 md:relative md:inset-auto md:p-0 md:bg-transparent' : 'hidden'} 
              md:block md:w-64 shrink-0
            `}>
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h2 className="font-semibold text-lg">{t('shop.filters')}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-8">
                {/* Category */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">{t('shop.category')}</h3>
                  <div className="space-y-2">
                    {['skincare', 'makeup'].map((category) => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedCategory.includes(category)}
                          onCheckedChange={(checked) => {
                            setSelectedCategory(prev => 
                              checked 
                                ? [...prev, category]
                                : prev.filter(c => c !== category)
                            )
                          }}
                        />
                        <span className="text-sm capitalize">{category === 'skincare' ? t('featured.skincare') : t('featured.makeup')}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Brand */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">{t('shop.brand')}</h3>
                  <div className="space-y-2">
                    {['AngeBae'].map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedBrand.includes(brand)}
                          onCheckedChange={(checked) => {
                            setSelectedBrand(prev => 
                              checked 
                                ? [...prev, brand]
                                : prev.filter(b => b !== brand)
                            )
                          }}
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">{t('shop.priceRange')}</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={200000}
                    step={5000}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatClp(priceRange[0])}</span>
                    <span>{formatClp(priceRange[1])}</span>
                  </div>
                </div>
                
                {/* Rating */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">{t('shop.rating')}</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={minRating === rating}
                          onCheckedChange={(checked) => setMinRating(checked ? rating : 0)}
                        />
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground ml-1">& up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    {t('shop.clearFilters')}
                  </Button>
                )}
              </div>
              
              {/* Mobile Apply Button */}
              <div className="mt-8 md:hidden">
                <Button onClick={() => setShowFilters(false)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Apply Filters
                </Button>
              </div>
            </aside>
            
            {/* Product Grid */}
            <div className="flex-1">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No products found matching your criteria.</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    {t('shop.clearFilters')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
