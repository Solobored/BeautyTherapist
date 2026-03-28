'use client'

import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/contexts/language-context'

export interface Review {
  id: string
  productId: string
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
  reviews: Review[]
  averageRating: number
  totalReviews: number
  onAddReview?: (review: Omit<Review, 'id' | 'date' | 'productId'>) => Promise<void>
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  totalReviews,
  onAddReview
}: ProductReviewsProps) {
  const { t } = useLanguage()
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [formData, setFormData] = useState({
    reviewerName: '',
    rating: 5,
    title: '',
    content: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.reviewerName || !formData.content) {
      alert('Por favor completa todos los campos')
      return
    }

    setIsSubmitting(true)
    try {
      if (onAddReview) {
        await onAddReview({
          productId,
          reviewerName: formData.reviewerName,
          rating: formData.rating,
          title: formData.title,
          content: formData.content,
          verifiedPurchase: false,
          date: new Date().toISOString()
        } as Omit<Review, 'id' | 'date' | 'productId'>)
        
        setFormData({
          reviewerName: '',
          rating: 5,
          title: '',
          content: ''
        })
        setIsAddingReview(false)
        alert('Reseña enviada para aprobación')
      }
    } catch (error) {
      alert('Error al enviar la reseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate?.(star)}
            disabled={!interactive}
            className={`transition-colors ${interactive ? 'cursor-pointer hover:text-accent' : ''}`}
          >
            <Star
              className={`h-4 w-4 ${
                star <= Math.round(rating)
                  ? 'fill-accent text-accent'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Reseñas de Clientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-start">
              <div className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
              <div className="flex gap-1 mt-2">
                {renderStars(averageRating)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {totalReviews} reseñas
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2 hidden sm:block">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(r => r.rating === stars).length
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-8">{stars}★</span>
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-accent rounded-full h-2 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Review Form */}
      {!isAddingReview ? (
        <Button
          onClick={() => setIsAddingReview(true)}
          variant="outline"
          className="w-full"
        >
          Escribir una reseña
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Comparte tu opinión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  placeholder="Tu nombre"
                  value={formData.reviewerName}
                  onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Calificación</Label>
                <div className="flex gap-2">
                  {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                  <span className="text-sm text-muted-foreground ml-2">{formData.rating}/5</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título (Opcional)</Label>
                <Input
                  placeholder="Ej: ¡Excelente producto!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tu opinión</Label>
                <Textarea
                  placeholder="Cuéntanos qué te parecen estos producto..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingReview(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          Todas las reseñas
        </h3>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No hay reseñas disponibles
          </p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{review.reviewerName}</div>
                      <div className="flex gap-2 items-center mt-1">
                        <div className="flex gap-0.5">
                          {renderStars(review.rating)}
                        </div>
                        {review.verifiedPurchase && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Compra verificada
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  {review.title && (
                    <div className="font-medium text-foreground">{review.title}</div>
                  )}

                  <p className="text-foreground">{review.content}</p>

                  <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      Útil ({review.helpfulCount || 0})
                    </button>
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
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
