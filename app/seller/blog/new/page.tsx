'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { sellerApiHeaders } from '@/hooks/use-seller-products'
import { toast } from 'sonner'

export default function SellerBlogNewPage() {
  const { t } = useLanguage()
  const { seller, isAuthenticated } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('wellness')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.push('/seller/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Título y contenido son obligatorios')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/seller/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...sellerApiHeaders(seller),
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), category }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error')
      toast.success('Entrada publicada')
      router.push('/seller/blog')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
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
              <h1 className="font-semibold">Nuevo post</h1>
              <p className="text-xs text-muted-foreground">{seller.brandName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              placeholder="Ej. Oferta 20% en séruns esta semana"
              required
            />
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
                <SelectItem value="wellness">Bienestar / tips</SelectItem>
                <SelectItem value="promo">Promociones</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className="mt-1"
              placeholder="Escribe en español: ofertas, cómo usar productos, rutinas…"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-accent text-accent-foreground" disabled={submitting}>
              {submitting ? t('common.loading') : 'Publicar'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/seller/blog">Cancelar</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
