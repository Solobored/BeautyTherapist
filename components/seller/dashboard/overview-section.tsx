'use client'

import Link from 'next/link'
import { AlertTriangle, Banknote, PackageCheck, ShoppingBag, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShippingLocationsMap } from '@/components/seller/ShippingLocationsMap'
import { pctChange } from '@/lib/seller-finance'
import { formatClp } from '@/lib/utils'
import type { Product } from '@/hooks/use-products'
import { SalesAreaChart } from './charts'
import { STATUS_LABEL, STATUS_STYLE, formatPct } from './format'
import { EmptyNote, KpiCard, Panel } from './ui'
import type { SellerFinance } from './use-seller-finance'
import { cn } from '@/lib/utils'

export function OverviewSection({ fin, products }: { fin: SellerFinance; products: Product[] }) {
  const { report, orders, loading } = fin
  const c = report.current
  const p = report.previous
  const active = products.filter((x) => x.status === 'active')
  const lowStock = active.filter((x) => x.stock < 10).sort((a, b) => a.stock - b.stock)
  const recent = orders.filter((o) => o.orderStatus !== 'cancelled').slice(0, 6)
  const toShip = orders.filter((o) => ['pending', 'processing'].includes(o.orderStatus) && o.paymentStatus === 'completed').length
  const geo = orders
    .filter((o) => o.shippingAddress?.lat && o.shippingAddress?.lng)
    .map((o) => ({ orderId: o.id, lat: o.shippingAddress!.lat, lng: o.shippingAddress!.lng, buyerName: o.buyerName, city: o.shippingAddress!.city || 'Ciudad desconocida' }))

  return (
    <div className="space-y-5 md:space-y-6">
      {toShip > 0 && (
        <Link href="/seller/orders" className="flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm transition-colors hover:bg-accent/15">
          <span className="flex items-center gap-2 font-medium text-foreground"><PackageCheck className="size-4 text-accent" aria-hidden />
            Tienes {toShip} {toShip === 1 ? 'pedido pagado listo' : 'pedidos pagados listos'} para preparar y enviar</span>
          <span className="shrink-0 text-accent font-medium">Ver pedidos →</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <KpiCard label="Ventas netas" icon={TrendingUp} value={formatClp(c.netSales)} delta={pctChange(c.netSales, p.netSales)} hint="vs periodo anterior" loading={loading} emphasis />
        <KpiCard label="Utilidad neta" icon={Banknote} value={formatClp(c.netProfit)} delta={pctChange(c.netProfit, p.netProfit)} hint={c.costCoverage < 1 ? 'costos incompletos' : `margen ${formatPct(c.margin)}`} loading={loading} />
        <KpiCard label="Pedidos" icon={ShoppingBag} value={String(c.orders)} delta={pctChange(c.orders, p.orders)} hint="vs periodo anterior" loading={loading} />
        <KpiCard label="Ticket promedio" icon={ShoppingBag} value={formatClp(c.aov)} delta={pctChange(c.aov, p.aov)} hint="por pedido" loading={loading} />
      </div>

      <div className="grid gap-5 md:gap-6 xl:grid-cols-3">
        <Panel title="Ventas del periodo" description="Ventas netas por día" className="xl:col-span-2">
          {c.orders === 0 && !loading ? <EmptyNote>Aún no hay ventas en este periodo.</EmptyNote> : <SalesAreaChart data={report.daily} />}
        </Panel>

        <Panel title="Atención necesaria" description="Stock bajo (menos de 10 unidades)"
          action={lowStock.length > 0 ? <AlertTriangle className="size-5 text-amber-500" aria-hidden /> : undefined}>
          {lowStock.length === 0 ? <EmptyNote>Todos tus productos tienen stock suficiente.</EmptyNote> : (
            <ul className="space-y-2">
              {lowStock.slice(0, 5).map((pr) => (
                <li key={pr.id} className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{pr.nameEs || pr.name}</p>
                    <p className="text-xs text-muted-foreground">{pr.stock} {pr.stock === 1 ? 'unidad' : 'unidades'}</p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="shrink-0"><Link href={`/seller/products/${pr.id}`}>Reponer</Link></Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Pedidos recientes" action={<Link href="/seller/orders" className="text-sm font-medium text-accent hover:underline">Ver todos</Link>} bodyClassName="p-0 md:p-0">
        {recent.length === 0 ? <EmptyNote>Aún no hay pedidos con tus productos.</EmptyNote> : (
          <>
            {/* Móvil: tarjetas */}
            <ul className="divide-y md:hidden">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{o.buyerName}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.items[0]?.name}{o.items.length > 1 ? ` +${o.items.length - 1}` : ''}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums">{formatClp(o.total)}</p>
                    <span className={cn('mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium', STATUS_STYLE[o.orderStatus] ?? 'bg-muted')}>{STATUS_LABEL[o.orderStatus] ?? o.orderStatus}</span>
                  </div>
                </li>
              ))}
            </ul>
            {/* Escritorio: tabla */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">Pedido</th><th className="px-3 py-2.5 font-medium">Cliente</th>
                  <th className="px-3 py-2.5 font-medium">Producto</th><th className="px-3 py-2.5 text-right font-medium">Total</th><th className="px-5 py-2.5 font-medium">Estado</th>
                </tr></thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</td>
                      <td className="px-3 py-3 font-medium">{o.buyerName}</td>
                      <td className="max-w-[18rem] truncate px-3 py-3 text-muted-foreground">{o.items[0]?.name}{o.items.length > 1 ? ` (+${o.items.length - 1})` : ''}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{formatClp(o.total)}</td>
                      <td className="px-5 py-3"><span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLE[o.orderStatus] ?? 'bg-muted')}>{STATUS_LABEL[o.orderStatus] ?? o.orderStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      {geo.length > 0 && (
        <Panel title="Mapa de entregas" description="Pedidos con ubicación de entrega"><ShippingLocationsMap locations={geo} /></Panel>
      )}
    </div>
  )
}
