'use client'

import { Repeat, ShoppingBag, Users } from 'lucide-react'
import { pctChange } from '@/lib/seller-finance'
import { formatClp } from '@/lib/utils'
import { SalesAreaChart } from './charts'
import { STATUS_LABEL, formatPct } from './format'
import { EmptyNote, KpiCard, Panel, RankBar } from './ui'
import type { SellerFinance } from './use-seller-finance'

export function SalesSection({ fin }: { fin: SellerFinance }) {
  const { report, loading } = fin
  const c = report.current, p = report.previous
  const topProducts = report.byProduct.slice(0, 6)
  const maxP = Math.max(...topProducts.map((x) => x.netSales), 0)
  const cities = report.topCities
  const maxC = Math.max(...cities.map((x) => x.netSales), 0)
  const totalStatus = report.byStatus.reduce((s, x) => s + x.count, 0)
  const order = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const statuses = [...report.byStatus].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <KpiCard label="Ventas netas" value={formatClp(c.netSales)} delta={pctChange(c.netSales, p.netSales)} loading={loading} icon={ShoppingBag} emphasis />
        <KpiCard label="Unidades vendidas" value={String(c.units)} delta={pctChange(c.units, p.units)} loading={loading} />
        <KpiCard label="Ticket promedio" value={formatClp(c.aov)} delta={pctChange(c.aov, p.aov)} loading={loading} />
        <KpiCard label="Cancelados" value={String(c.cancelledCount)} delta={pctChange(c.cancelledCount, p.cancelledCount)} deltaInverse hint={c.cancelledValue ? formatClp(c.cancelledValue) : undefined} loading={loading} />
      </div>

      <Panel title="Evolución de ventas" description="Ventas netas por día en el periodo seleccionado">
        {c.orders === 0 && !loading ? <EmptyNote>Aún no hay ventas en este periodo.</EmptyNote> : <SalesAreaChart data={report.daily} height={300} />}
      </Panel>

      <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
        <Panel title="Productos más vendidos" description="Por ventas netas">
          {topProducts.length === 0 ? <EmptyNote>Sin ventas en este periodo.</EmptyNote> : (
            <ul className="space-y-4">{topProducts.map((x) => <RankBar key={x.id} label={x.name} value={x.netSales} max={maxP} display={formatClp(x.netSales)} sub={`${x.units} ${x.units === 1 ? 'unidad' : 'unidades'}`} />)}</ul>
          )}
        </Panel>

        <div className="space-y-5 md:space-y-6">
          <Panel title="Clientes" description="Según todo tu historial de pedidos">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/60 p-4"><Users className="mb-2 size-4 text-accent" aria-hidden /><p className="font-serif text-2xl font-semibold tabular-nums">{report.customers.unique}</p><p className="text-xs text-muted-foreground">clientes únicos</p></div>
              <div className="rounded-xl bg-muted/60 p-4"><Repeat className="mb-2 size-4 text-accent" aria-hidden /><p className="font-serif text-2xl font-semibold tabular-nums">{formatPct(report.customers.returningRate, 0)}</p><p className="text-xs text-muted-foreground">compran de nuevo</p></div>
            </div>
          </Panel>

          <Panel title="Pedidos por estado">
            {totalStatus === 0 ? <EmptyNote>Sin pedidos en este periodo.</EmptyNote> : (
              <ul className="space-y-2.5">
                {statuses.map((s) => (
                  <li key={s.status} className="flex items-center gap-3 text-sm">
                    <span className="w-28 shrink-0 text-muted-foreground">{STATUS_LABEL[s.status] ?? s.status}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${(s.count / totalStatus) * 100}%` }} /></div>
                    <span className="w-8 shrink-0 text-right tabular-nums">{s.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <Panel title="Ciudades principales" description="Dónde están tus clientes">
        {cities.length === 0 ? <EmptyNote>Aún no hay ciudades registradas en los pedidos.</EmptyNote> : (
          <ul className="grid gap-4 md:grid-cols-2">{cities.map((x) => <RankBar key={x.city} label={x.city} value={x.netSales} max={maxC} display={formatClp(x.netSales)} sub={`${x.orders} ${x.orders === 1 ? 'pedido' : 'pedidos'}`} />)}</ul>
        )}
      </Panel>
    </div>
  )
}
