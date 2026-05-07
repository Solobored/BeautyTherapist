'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Send, Star, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export interface Review {
  id: string
  productId?: string
  referencedProduct?: {
    id: string
    name: string
    imageUrl: string
    slug: string
  }
  reviewerName: string
  rating: number
  title?: string
  content: string
  verifiedPurchase?: boolean
  date: string
  helpfulCount?: number
}

interface ProductReviewsProps {
  productId: string
  brandId?: string
  reviews?: Review[]
  averageRating: number
  totalReviews: number
}

type SearchProduct = {
  id: string
  name: string
  imageUrl: string
  slug: string
  price: number
}

export function ProductReviews({
  productId,
  brandId,
  reviews = [],
  averageRating,
  totalReviews,
}: ProductReviewsProps) {
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [formData, setFormData] = useState({
    reviewerName: '',
    rating: 5,
    title: '',
    content: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
  const [selectedReferencedProduct, setSelectedReferencedProduct] = useState<SearchProduct | null>(null)
  const [loadedReviews, setLoadedReviews] = useState<Review[]>(reviews)
  const [loadedAverage, setLoadedAverage] = useState(averageRating)
  const [loadedTotal, setLoadedTotal] = useState(totalReviews)

  async function loadReviews() {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al cargar reseñas')
      setLoadedReviews(json.reviews ?? [])
      setLoadedAverage(json.averageRating ?? 0)
      setLoadedTotal(json.totalReviews ?? 0)
    } catch {
      setLoadedReviews(reviews)
      setLoadedAverage(averageRating)
      setLoadedTotal(totalReviews)
    }
  }

  useEffect(() => {
    setLoadedReviews(reviews)
    setLoadedAverage(averageRating)
    setLoadedTotal(totalReviews)
    void loadReviews()
  }, [productId, reviews, averageRating, totalReviews])

  useEffect(() => {
    if (!brandId || !isAddingReview) {
      setSearchResults([])
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const params = new URLSearchParams()
        params.set('brandId', brandId)
        params.set('search', productSearch)
        const res = await fetch(`/api/products?${params.toString()}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Error')
        if (!cancelled) setSearchResults(json.products ?? [])
      } catch {
        if (!cancelled) setSearchResults([])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [brandId, isAddingReview, productSearch])

  const visibleReviews = useMemo(() => loadedReviews, [loadedReviews])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formData.reviewerName.trim() || !formData.content.trim()) {
      toast.error('Por favor completa nombre y reseña')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          reviewerName: formData.reviewerName.trim(),
          rating: formData.rating,
          title: formData.title.trim(),
          content: formData.content.trim(),
          referencedProductId: selectedReferencedProduct?.id ?? null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al guardar reseña')
      toast.success('Reseña enviada correctamente')
      setFormData({ reviewerName: '', rating: 5, title: '', content: '' })
      setSelectedReferencedProduct(null)
      setIsAddingReview(false)
      await loadReviews()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar la reseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  function renderStars(rating: number, interactive = false, onRate?: (value: number) => void) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate?.(star)}
            disabled={!interactive}
            className={interactive ? 'cursor-pointer transition-colors hover:text-accent' : ''}
          >
            <Star
              className={`h-4 w-4 ${
                star <= Math.round(rating) ? 'fill-accent text-accent' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Reseñas de clientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-start">
              <div className="text-4xl font-bold text-foreground">{loadedAverage.toFixed(1)}</div>
              <div className="mt-2 flex gap-1">{renderStars(loadedAverage)}</div>
              <p className="mt-1 text-sm text-muted-foreground">{loadedTotal} reseñas</p>
            </div>

            <div className="hidden flex-1 space-y-2 sm:block">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = visibleReviews.filter((review) => review.rating === stars).length
                const percentage = loadedTotal > 0 ? (count / loadedTotal) * 100 : 0
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-8 text-sm text-muted-foreground">{stars}★</span>
                    <div className="h-2 flex-1 rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-right text-sm text-muted-foreground">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {!isAddingReview ? (
        <Button onClick={() => setIsAddingReview(true)} variant="outline" className="w-full">
          Escribir una reseña
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparte tu opinión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  placeholder="Tu nombre"
                  value={formData.reviewerName}
                  onChange={(event) => setFormData({ ...formData, reviewerName: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Calificación</Label>
                <div className="flex items-center gap-2">
                  {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                  <span className="ml-2 text-sm text-muted-foreground">{formData.rating}/5</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título (opcional)</Label>
                <Input
                  placeholder="Ej. Textura increible"
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tu opinión</Label>
                <Textarea
                  placeholder="Cuéntanos qué te pareció este producto..."
                  value={formData.content}
                  onChange={(event) => setFormData({ ...formData, content: event.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>¿Sobre qué producto estás escribiendo? (opcional)</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto de la marca..."
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    className="pl-9"
                  />
                </div>
                {selectedReferencedProduct && (
                  <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm">
                    <span>📦 {selectedReferencedProduct.name}</span>
                    <button type="button" onClick={() => setSelectedReferencedProduct(null)}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSelectedReferencedProduct(product)}
                      className="flex w-full items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-left hover:border-accent/40"
                    >
                      <span>{product.name}</span>
                      <span className="text-sm text-muted-foreground">CLP {product.price.toLocaleString('es-CL')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Enviando...' : 'Enviar reseña'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingReview(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Todas las reseñas</h3>
        {visibleReviews.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No hay reseñas disponibles</p>
        ) : (
          visibleReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{review.reviewerName}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                        {review.verifiedPurchase && (
                          <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            Compra verificada
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('es-CL')}
                    </span>
                  </div>

                  {review.title && <div className="font-medium text-foreground">{review.title}</div>}

                  <p className="text-foreground">{review.content}</p>

                  {review.referencedProduct && (
                    <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 text-sm">
                      <p className="mb-1 font-medium">📦 Sobre: {review.referencedProduct.name}</p>
                      <Link href={`/shop/${review.referencedProduct.slug}`} className="text-accent hover:underline">
                        Ver producto
                      </Link>
                    </div>
                  )}

                  <div className="flex gap-4 pt-2 text-sm text-muted-foreground">
                    <button type="button" className="flex items-center gap-1 transition-colors hover:text-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      Útil ({review.helpfulCount || 0})
                    </button>
                    <button type="button" className="flex items-center gap-1 transition-colors hover:text-foreground">
                      <ThumbsDown className="h-4 w-4" />
                      No útil
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
