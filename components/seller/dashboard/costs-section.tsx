'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatClp } from '@/lib/utils'
import type { Product } from '@/hooks/use-products'
import { sellerApiHeaders } from '@/hooks/use-seller-products'
import { formatPct } from './format'
import { EmptyNote, KpiCard, Panel, RankBar } from './ui'
import { DEFAULT_PAYMENT_FEE, type SellerFinance } from './use-seller-finance'

export function CostsSection({ fin, products, seller }: { fin: SellerFinance; products: Product[]; seller: { email: string; brandName: string } }) {
  const { report, productCosts, loading, paymentFeeRate, setPaymentFeeRate, reload } = fin
  const c = report.current
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const pctStr = (r: number) => String(Number((r * 100).toFixed(2)))
  const [feeInput, setFeeInput] = useState(pctStr(paymentFeeRate))

  useEffect(() => {
    const d: Record<string, string> = {}
    for (const p of products) d[p.id] = productCosts[p.id] != null ? String(productCosts[p.id]) : ''
    setDraft(d)
  }, [products, productCosts])

  const dirty = products.filter((p) => (draft[p.id] ?? '') !== (productCosts[p.id] != null ? String(productCosts[p.id]) : ''))
  const maxCost = Math.max(...report.costBreakdown.map((x) => x.value), 0)
  const totalCosts = c.cogs + c.marketplaceFee + c.paymentFee
  const missing = products.filter((p) => p.status === 'active' && productCosts[p.id] == null).length

  const save = async () => {
    const costs: Record<string, number | null> = {}
    for (const p of dirty) {
      const raw = (draft[p.id] ?? '').trim().replace(',', '.')
      costs[p.id] = raw === '' ? null : Number(raw)
      if (costs[p.id] !== null && (!Number.isFinite(costs[p.id]!) || costs[p.id]! < 0)) {
        toast.error(`Costo inválido en “${p.nameEs || p.name}”`)
        return
      }
    }
    setSaving(true)
    try {
      const res = await fetch('/api/seller/finance/costs', { method: 'PUT', headers: { ...sellerApiHeaders(seller), 'Content-Type': 'application/json' }, body: JSON.stringify({ costs }) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'No se pudieron guardar los costos')
      toast.success('Costos guardados')
      await reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const applyFee = () => {
    const n = Number(feeInput.replace(',', '.'))
    if (!Number.isFinite(n) || n < 0 || n > 20) { toast.error('Ingresa un porcentaje entre 0 y 20'); return }
    setPaymentFeeRate(n / 100)
    toast.success('Tasa actualizada')
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <KpiCard label="Costos totales" value={formatClp(totalCosts)} loading={loading} emphasis hint="producto + comisiones" />
        <KpiCard label="Costo de productos" value={formatClp(c.cogs)} loading={loading} hint={c.units ? `cobertura ${formatPct(c.costCoverage, 0)}` : undefined} />
        <KpiCard label="Comisiones" value={formatClp(c.marketplaceFee + c.paymentFee)} loading={loading} hint="plataforma + pago" />
        <KpiCard label="Costos / ventas" value={c.netSales > 0 ? formatPct(totalCosts / c.netSales) : '—'} loading={loading} />
      </div>

      <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
        <Panel title="¿Dónde se va el dinero?" description="Del periodo seleccionado">
          {report.costBreakdown.every((x) => x.value === 0) ? <EmptyNote>Sin costos registrados en este periodo.</EmptyNote> : (
            <ul className="space-y-4">{report.costBreakdown.map((x) => <RankBar key={x.key} label={x.label} value={x.value} max={maxCost} display={formatClp(x.value)} sub={c.netSales > 0 ? `${formatPct(x.value / c.netSales)} de las ventas netas` : undefined} />)}</ul>
          )}
        </Panel>

        <Panel title="Comisión de pago" description="Lo que cobra el procesador de pagos por cada venta">
          <div className="space-y-3">
            <Label htmlFor="fee">Tasa estimada (%)</Label>
            <div className="flex gap-2">
              <Input id="fee" inputMode="decimal" value={feeInput} onChange={(e) => setFeeInput(e.target.value)} className="max-w-32" />
              <Button type="button" variant="outline" onClick={applyFee}>Aplicar</Button>
              <Button type="button" variant="ghost" onClick={() => { setFeeInput(pctStr(DEFAULT_PAYMENT_FEE)); setPaymentFeeRate(DEFAULT_PAYMENT_FEE) }}>Restablecer</Button>
            </div>
            <p className="text-xs text-muted-foreground">Es una estimación (por defecto {pctStr(DEFAULT_PAYMENT_FEE)}%) y se guarda solo en este navegador. Revisa la tarifa real de tu cuenta de Mercado Pago para que la utilidad sea exacta. La comisión de la plataforma sí se toma del pedido real.</p>
          </div>
        </Panel>
      </div>

      <Panel
        title="Costo unitario por producto"
        description={missing > 0 ? `${missing} ${missing === 1 ? 'producto activo sin costo' : 'productos activos sin costo'}. Sin costo no se puede calcular el margen.` : 'Todos tus productos activos tienen costo.'}
        action={<Button onClick={save} disabled={saving || dirty.length === 0} className="bg-accent text-accent-foreground hover:bg-accent/90">{saving ? 'Guardando…' : dirty.length ? `Guardar (${dirty.length})` : 'Guardar'}</Button>}
        bodyClassName="p-0 md:p-0"
      >
        {products.length === 0 ? <EmptyNote>Aún no tienes productos.</EmptyNote> : (
          <ul className="divide-y">
            {products.map((p) => {
              const raw = Number((draft[p.id] ?? '').replace(',', '.'))
              const has = (draft[p.id] ?? '') !== '' && Number.isFinite(raw)
              const margin = has && p.price > 0 ? (p.price - raw) / p.price : null
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-5">
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate text-sm font-medium">{p.nameEs || p.name}</p>
                    <p className="text-xs text-muted-foreground">Precio {formatClp(p.price)}{margin !== null && <> · margen bruto <span className={margin < 0.2 ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-foreground font-medium'}>{formatPct(margin, 0)}</span></>}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`c-${p.id}`} className="sr-only">Costo de {p.nameEs || p.name}</Label>
                    <span className="text-sm text-muted-foreground" aria-hidden>$</span>
                    <Input id={`c-${p.id}`} inputMode="decimal" placeholder="Costo" value={draft[p.id] ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [p.id]: e.target.value }))} className="w-28 text-right tabular-nums" />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
    </div>
  )
}
