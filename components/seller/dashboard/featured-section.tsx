'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatClp } from '@/lib/utils'
import type { Product } from '@/hooks/use-products'
import { sellerApiHeaders } from '@/hooks/use-seller-products'
import { EmptyNote, Panel } from './ui'

type SellerLike = { email: string; brandName: string }

export function FeaturedSection({ seller, products }: { seller: SellerLike; products: Product[] }) {
  const [ids, setIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const active = products.filter((p) => p.status === 'active')

  useEffect(() => {
    let off = false
    fetch('/api/seller/profile', { headers: sellerApiHeaders(seller) })
      .then((r) => r.json()).then((j) => { if (!off && j.brand?.featured_product_ids) setIds(j.brand.featured_product_ids) }).catch(() => {})
    return () => { off = true }
  }, [seller])

  const toggle = async (id: string) => {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    setSaving(true)
    try {
      const res = await fetch('/api/seller/profile', { method: 'PUT', headers: { ...sellerApiHeaders(seller), 'Content-Type': 'application/json' }, body: JSON.stringify({ featuredProductIds: next }) })
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || j.details || 'No se pudo actualizar') }
      setIds(next); toast.success('Destacados actualizados')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error') } finally { setSaving(false) }
  }

  return (
    <Panel title="Elige tus productos destacados" description={`${ids.length} seleccionados. Aparecen primero en tu página pública.`}>
      {active.length === 0 ? <EmptyNote>No tienes productos activos todavía.</EmptyNote> : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {active.map((p) => {
            const on = ids.includes(p.id)
            return (
              <li key={p.id} className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-colors ${on ? 'border-accent bg-accent/5' : 'border-border'}`}>
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">{/* eslint-disable-next-line @next/next/no-img-element */}{p.imageUrl && <img src={p.imageUrl} alt="" className="size-full object-cover" />}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.nameEs || p.name}</p><p className="text-xs text-muted-foreground">{formatClp(p.price)} · stock {p.stock}</p></div>
                <Button size="sm" variant={on ? 'default' : 'outline'} disabled={saving} onClick={() => toggle(p.id)} aria-pressed={on} className="shrink-0">
                  {on ? <><Check className="mr-1 size-4" />Destacado</> : 'Destacar'}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
