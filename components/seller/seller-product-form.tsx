'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ImageUploadZone } from '@/components/checkout/ImageUploadZone'
import { useLanguage } from '@/contexts/language-context'
import type { Seller } from '@/contexts/auth-context'
import { sellerApiHeaders } from '@/hooks/use-seller-products'
import { formatClp } from '@/lib/utils'
import { toast } from 'sonner'

type UploadedImage = { url: string; publicId: string; position: number }

type Props = {
  seller: Seller
  mode: 'create' | 'edit'
  productId?: string
}

export function SellerProductForm({ seller, mode, productId }: Props) {
  const { t } = useLanguage()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [howToUse, setHowToUse] = useState('')
  const [category, setCategory] = useState<'skincare' | 'makeup' | ''>('')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [stock, setStock] = useState('')
  const [active, setActive] = useState(false)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [loading, setLoading] = useState(mode === 'edit')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mode !== 'edit' || !productId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/seller/products/${productId}`, {
          headers: sellerApiHeaders(seller),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Error')
        const p = json.product
        if (cancelled) return
        setName(p.nameEs ?? p.name ?? '')
        setDescription(p.descriptionEs ?? p.description ?? '')
        setIngredients(p.ingredients ?? '')
        setHowToUse(p.howToUseEs ?? p.howToUse ?? '')
        setCategory(p.category ?? '')
        setPrice(String(Math.round(Number(p.price))))
        setComparePrice(p.comparePrice != null ? String(Math.round(Number(p.comparePrice))) : '')
        setStock(String(p.stock ?? 0))
        setActive(p.status === 'active')
        setImages(
          (p.images ?? []).map((url: string, i: number) => ({
            url,
            publicId: url,
            position: i,
          }))
        )
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error al cargar')
        router.push('/seller/products')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mode, productId, seller, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const priceNum = parseInt(price, 10)
    const stockNum = parseInt(stock, 10)
    if (!name.trim()) {
      toast.error('Indica el nombre del producto')
      return
    }
    if (!category) {
      toast.error('Selecciona una categoría')
      return
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error('Precio inválido')
      return
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      toast.error('Stock inválido')
      return
    }
    if (images.length < 1) {
      toast.error('Sube al menos una imagen WebP')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        ingredients: ingredients.trim(),
        howToUse: howToUse.trim(),
        category,
        price: priceNum,
        comparePrice: comparePrice.trim() ? parseInt(comparePrice, 10) : null,
        stock: stockNum,
        status: active ? 'active' : 'draft',
        images: images.map((img, i) => ({ url: img.url, position: i })),
      }

      if (mode === 'create') {
        const res = await fetch('/api/seller/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...sellerApiHeaders(seller) },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'No se pudo guardar')
        toast.success('Producto guardado')
        router.push('/seller/products')
      } else {
        const res = await fetch(`/api/seller/products/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...sellerApiHeaders(seller) },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'No se pudo actualizar')
        toast.success('Producto actualizado')
        router.push('/seller/products')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  const previewPrice = parseInt(price, 10)
  const showPreview = !Number.isNaN(previewPrice) && previewPrice >= 0

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h2 className="font-semibold mb-4">Datos del producto</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Ej. Sérum vitamina C"
                />
              </div>
              <div>
                <Label htmlFor="category">{t('products.category')}</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as 'skincare' | 'makeup')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skincare">Skincare</SelectItem>
                    <SelectItem value="makeup">Makeup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ingredients">{t('product.ingredients')}</Label>
                <Textarea
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="howToUse">{t('product.howToUse')}</Label>
                <Textarea
                  id="howToUse"
                  value={howToUse}
                  onChange={(e) => setHowToUse(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h2 className="font-semibold mb-4">{t('products.images')}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sube imágenes WebP desde tu equipo (arrastra o haz clic).
            </p>
            {(mode === 'create' || !loading) && (
              <ImageUploadZone
                key={mode === 'edit' ? `${productId}-${images.length}` : 'create'}
                webpOnly
                maxImages={8}
                initialImages={images}
                onImagesChange={(imgs) =>
                  setImages(
                    imgs.map((img, i) => ({
                      url: img.url,
                      publicId: img.publicId,
                      position: i,
                    }))
                  )
                }
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h2 className="font-semibold mb-4">Precios (CLP)</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="29990"
                />
                {showPreview && (
                  <p className="text-xs text-muted-foreground mt-1">Vista: {formatClp(previewPrice)}</p>
                )}
              </div>
              <div>
                <Label htmlFor="comparePrice">Precio de comparación (opcional)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  min={0}
                  step={1}
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  className="mt-1"
                  placeholder="39990"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h2 className="font-semibold mb-4">Inventario</h2>
            <div>
              <Label htmlFor="stock">{t('products.stock')}</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                step={1}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h2 className="font-semibold mb-4">{t('products.status')}</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('products.active')}</p>
                <p className="text-sm text-muted-foreground">Visible en la tienda</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={submitting}
            >
              {submitting ? t('common.loading') : t('products.save')}
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href="/seller/products">{t('common.cancel')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export function SellerProductFormHeader({
  seller,
  title = 'Producto',
}: {
  seller: { brandName: string }
  title?: string
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/seller/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold">{title}</h1>
            <p className="text-xs text-muted-foreground">{seller.brandName}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
