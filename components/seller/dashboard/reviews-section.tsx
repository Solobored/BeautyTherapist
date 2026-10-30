'use client'

import { useEffect, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sellerApiHeaders } from '@/hooks/use-seller-products'
import { EmptyNote, Panel } from './ui'

type Review = { id: string; customerName: string; text: string; rating: number }
type SellerLike = { email: string; brandName: string }

async function putProfile(seller: SellerLike, body: object) {
  const res = await fetch('/api/seller/profile', { method: 'PUT', headers: { ...sellerApiHeaders(seller), 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'No se pudo guardar') }
}

export function ReviewsSection({ seller }: { seller: SellerLike }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [form, setForm] = useState({ customerName: '', text: '', rating: 5 })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let off = false
    fetch('/api/seller/profile', { headers: sellerApiHeaders(seller) })
      .then((r) => r.json()).then((j) => { if (!off && j.brand?.custom_reviews) setReviews(j.brand.custom_reviews) }).catch(() => {})
    return () => { off = true }
  }, [seller])

  const add = async () => {
    if (!form.customerName.trim() || !form.text.trim()) return
    setBusy(true)
    const next = [...reviews, { id: Date.now().toString(), ...form }]
    try { await putProfile(seller, { customReviews: next }); setReviews(next); setForm({ customerName: '', text: '', rating: 5 }); toast.success('Reseña agregada') }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error') } finally { setBusy(false) }
  }
  const remove = async (id: string) => {
    const next = reviews.filter((r) => r.id !== id)
    try { await putProfile(seller, { customReviews: next }); setReviews(next); toast.success('Reseña eliminada') }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error') }
  }

  return (
    <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
      <Panel title="Agregar reseña" description="Se muestra en tu página pública de marca">
        <div className="space-y-4">
          <div className="space-y-1.5"><label htmlFor="rv-name" className="text-sm font-medium">Nombre del cliente</label>
            <Input id="rv-name" placeholder="Ej: María García" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} /></div>
          <div className="space-y-1.5"><label htmlFor="rv-text" className="text-sm font-medium">Reseña</label>
            <Input id="rv-text" placeholder="Ej: Excelentes productos, muy recomendados" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
          <div role="radiogroup" aria-label="Puntuación" className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={n === form.rating} aria-label={`${n} estrellas`} onClick={() => setForm({ ...form, rating: n })}
                className={`rounded p-1.5 ${n <= form.rating ? 'text-amber-500' : 'text-muted-foreground/40'}`}><Star className={`size-6 ${n <= form.rating ? 'fill-current' : ''}`} /></button>
            ))}
          </div>
          <Button onClick={add} disabled={busy} className="bg-accent text-accent-foreground hover:bg-accent/90">{busy ? 'Agregando…' : 'Agregar reseña'}</Button>
        </div>
      </Panel>
      <Panel title={`Reseñas agregadas (${reviews.length})`}>
        {reviews.length === 0 ? <EmptyNote>Aún no has agregado reseñas.</EmptyNote> : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 rounded-xl bg-muted/60 p-4">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2"><span className="truncate text-sm font-medium">{r.customerName}</span>
                    <span className="flex" aria-label={`${r.rating} estrellas`}>{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-3.5 fill-amber-500 text-amber-500" />)}</span></div>
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label={`Eliminar reseña de ${r.customerName}`} className="shrink-0 text-rose-600"><Trash2 className="size-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
