'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'

export default function NewProductPage() {
  const { t } = useLanguage()
  const { seller, isAuthenticated } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    nameEn: '',
    nameEs: '',
    category: '',
    descriptionEn: '',
    descriptionEs: '',
    ingredients: '',
    howToUseEn: '',
    howToUseEs: '',
    price: '',
    comparePrice: '',
    stock: '',
    status: 'draft'
  })
  
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/seller/login')
    }
  }, [isAuthenticated, router])
  
  if (!isAuthenticated || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    )
  }
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleAddImage = () => {
    // Simulating image upload with placeholder
    const placeholderImages = [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&h=600&fit=crop'
    ]
    const newImage = placeholderImages[images.length % placeholderImages.length]
    setImages(prev => [...prev, newImage])
  }
  
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    router.push('/seller/products')
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/seller/products">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold">{t('products.addNew')}</h1>
              <p className="text-xs text-muted-foreground">{seller.brandName}</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <h2 className="font-semibold mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nameEn">{t('products.name')} (EN)</Label>
                      <Input
                        id="nameEn"
                        value={formData.nameEn}
                        onChange={(e) => handleInputChange('nameEn', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nameEs">{t('products.name')} (ES)</Label>
                      <Input
                        id="nameEs"
                        value={formData.nameEs}
                        onChange={(e) => handleInputChange('nameEs', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">{t('products.category')}</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skincare">Skincare</SelectItem>
                        <SelectItem value="makeup">Makeup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="descriptionEn">{t('product.description')} (EN)</Label>
                      <Textarea
                        id="descriptionEn"
                        value={formData.descriptionEn}
                        onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descriptionEs">{t('product.description')} (ES)</Label>
                      <Textarea
                        id="descriptionEs"
                        value={formData.descriptionEs}
                        onChange={(e) => handleInputChange('descriptionEs', e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="ingredients">{t('product.ingredients')}</Label>
                    <Textarea
                      id="ingredients"
                      value={formData.ingredients}
                      onChange={(e) => handleInputChange('ingredients', e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="howToUseEn">{t('product.howToUse')} (EN)</Label>
                      <Textarea
                        id="howToUseEn"
                        value={formData.howToUseEn}
                        onChange={(e) => handleInputChange('howToUseEn', e.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="howToUseEs">{t('product.howToUse')} (ES)</Label>
                      <Textarea
                        id="howToUseEs"
                        value={formData.howToUseEs}
                        onChange={(e) => handleInputChange('howToUseEs', e.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Images */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <h2 className="font-semibold mb-4">{t('products.images')}</h2>
                
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                      <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center hover:bg-background"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-accent transition-colors"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add Image</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <h2 className="font-semibold mb-4">Pricing</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="price">{t('products.price')} (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                      className="mt-1"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="comparePrice">{t('products.comparePrice')}</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      value={formData.comparePrice}
                      onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                      className="mt-1"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional. Show original price for discounts.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Inventory */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <h2 className="font-semibold mb-4">Inventory</h2>
                
                <div>
                  <Label htmlFor="stock">{t('products.stock')}</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    required
                    className="mt-1"
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* Status */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <h2 className="font-semibold mb-4">{t('products.status')}</h2>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('products.active')}</p>
                    <p className="text-sm text-muted-foreground">Product will be visible in store</p>
                  </div>
                  <Switch
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'draft')}
                  />
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('common.loading') : t('products.save')}
                </Button>
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link href="/seller/products">{t('common.cancel')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
