'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploadZone } from '@/components/checkout/ImageUploadZone'
import { sellerApiHeaders } from '@/hooks/use-seller-products'
import { toast } from 'sonner'

type SellerLite = {
  email: string
  brandName: string
}

type BlogProduct = {
  id: string
  name: string
  imageUrl: string
  price: number
  slug: string
}

type UploadedImage = {
  url: string
  publicId: string
  position: number
}

type BlogPostPayload = {
  title: string
  content: string
  category: string
  coverImage?: string | null
  images: UploadedImage[]
  productIds: string[]
}

type Props = {
  seller: SellerLite
  mode: 'create' | 'edit'
  postId?: string
  initialPost?: {
    title: string
    content: string
    category: string
    images: UploadedImage[]
    products: BlogProduct[]
  } | null
}

export function SellerBlogPostForm({ seller, mode, postId, initialPost }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialPost?.title ?? '')
  const [content, setContent] = useState(initialPost?.content ?? '')
  const [category, setCategory] = useState(initialPost?.category ?? 'wellness')
  const [images, setImages] = useState<UploadedImage[]>(initialPost?.images ?? [])
  const [productSearch, setProductSearch] = useState('')
  const [availableProducts, setAvailableProducts] = useState<BlogProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<BlogProduct[]>(initialPost?.products ?? [])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setTitle(initialPost?.title ?? '')
    setContent(initialPost?.content ?? '')
    setCategory(initialPost?.category ?? 'wellness')
    setImages(initialPost?.images ?? [])
    setSelectedProducts(initialPost?.products ?? [])
  }, [initialPost])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoadingProducts(true)
      try {
        const params = new URLSearchParams()
        params.set('search', productSearch)
        params.set('sellerOnly', 'true')
        const res = await fetch(`/api/products?${params.toString()}`, {
          headers: sellerApiHeaders(seller),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Error al buscar productos')
        if (!cancelled) setAvailableProducts(json.products ?? [])
      } catch (error) {
        if (!cancelled) {
          setAvailableProducts([])
        }
      } finally {
        if (!cancelled) setLoadingProducts(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [productSearch, seller])

  const selectedProductIds = useMemo(
    () => new Set(selectedProducts.map((product) => product.id)),
    [selectedProducts]
  )

  function toggleProduct(product: BlogProduct) {
    setSelectedProducts((current) =>
      current.some((item) => item.id === product.id)
        ? current.filter((item) => item.id !== product.id)
        : [...current, product]
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Titulo y contenido son obligatorios')
      return
    }

    const payload: BlogPostPayload = {
      title: title.trim(),
      content: content.trim(),
      category,
      coverImage: images[0]?.url ?? null,
      images,
      productIds: selectedProducts.map((product) => product.id),
    }

    setSubmitting(true)
    try {
      const res = await fetch(mode === 'create' ? '/api/seller/blog' : `/api/seller/blog/${postId}`, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...sellerApiHeaders(seller),
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudo guardar el post')
      toast.success(mode === 'create' ? 'Post publicado' : 'Post actualizado')
      router.push('/seller/blog')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/seller/blog">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold">{mode === 'create' ? 'Nuevo post' : 'Editar post'}</h1>
              <p className="text-xs text-muted-foreground">{seller.brandName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="mb-4 font-semibold">Contenido del articulo</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titulo</Label>
                  <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skincare">Skincare</SelectItem>
                      <SelectItem value="makeup">Maquillaje</SelectItem>
                      <SelectItem value="wellness">Bienestar</SelectItem>
                      <SelectItem value="ingredients">Ingredientes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Contenido</Label>
                  <Textarea
                    id="content"
                    rows={16}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    className="mt-1"
                    placeholder="Escribe el articulo en espanol..."
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="mb-2 font-semibold">Galeria de imagenes</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                La primera imagen queda como portada del articulo.
              </p>
              <ImageUploadZone
                folder="beauty-therapy/blog"
                webpOnly={false}
                maxImages={8}
                initialImages={images}
                onImagesChange={(nextImages) => setImages(nextImages)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="mb-4 font-semibold">Productos adjuntos</h2>
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Buscar productos..."
                  className="pl-9"
                />
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
                    <span>{product.name}</span>
                    <button type="button" onClick={() => toggleProduct(product)} aria-label={`Quitar ${product.name}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {selectedProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground">Todavia no adjuntas productos.</p>
                )}
              </div>

              <div className="space-y-2">
                {loadingProducts ? (
                  <p className="text-sm text-muted-foreground">Buscando productos...</p>
                ) : (
                  availableProducts.map((product) => {
                    const selected = selectedProductIds.has(product.id)
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProduct(product)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                          selected ? 'border-accent bg-accent/5' : 'border-border/60 hover:border-accent/40'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">CLP {product.price.toLocaleString('es-CL')}</p>
                        </div>
                        <span className="text-sm">{selected ? 'Seleccionado' : 'Adjuntar'}</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h2 className="mb-4 font-semibold">Publicacion</h2>
              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={submitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {submitting ? 'Guardando...' : mode === 'create' ? 'Publicar post' : 'Guardar cambios'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/seller/blog">Cancelar</Link>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
