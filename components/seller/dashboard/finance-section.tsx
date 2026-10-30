'use client'

import { Banknote, Clock, Percent, PiggyBank } from 'lucide-react'
import { pctChange } from '@/lib/seller-finance'
import { formatClp } from '@/lib/utils'
import { MonthlyProfitChart } from './charts'
import { formatPct } from './format'
import { EmptyNote, KpiCard, Panel } from './ui'
import type { SellerFinance } from './use-seller-finance'

function Row({ label, value, strong, negative, note }: { label: string; value: number; strong?: boolean; negative?: boolean; note?: string }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2.5 ${strong ? 'border-t-2 border-foreground/15 pt-3' : 'border-b border-dashed last:border-0'}`}>
      <div className="min-w-0">
        <p className={`text-sm ${strong ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{label}</p>
        {note && <p className="text-xs text-muted-foreground/80">{note}</p>}
      </div>
      <p className={`shrink-0 tabular-nums ${strong ? 'font-serif text-xl font-semibold' : 'text-sm font-medium'} ${negative && value > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
        {negative && value > 0 ? '−' : ''}{formatClp(value)}
      </p>
    </div>
  )
}

export function FinanceSection({ fin }: { fin: SellerFinance }) {
  const { report, loading } = fin
  const c = report.current, p = report.previous
  const incomplete = c.costCoverage < 1 && c.units > 0

  return (
    <div className="space-y-5 md:space-y-6">
      {incomplete && (
        <div role="status" className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Solo tienes costo cargado para el {formatPct(c.costCoverage, 0)} de las unidades vendidas, así que la utilidad está sobreestimada.
          Completa los costos en la sección <strong>Costos</strong> para ver tu utilidad real.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <KpiCard label="Ventas netas" icon={Banknote} value={formatClp(c.netSales)} delta={pctChange(c.netSales, p.netSales)} loading={loading} emphasis />
        <KpiCard label="Utilidad neta" icon={PiggyBank} value={formatClp(c.netProfit)} delta={pctChange(c.netProfit, p.netProfit)} loading={loading} hint={incomplete ? 'estimada' : undefined} />
        <KpiCard label="Margen neto" icon={Percent} value={formatPct(c.margin)} delta={pctChange(c.margin, p.margin)} loading={loading} />
        <KpiCard label="Por cobrar" icon={Clock} value={formatClp(c.receivable)} hint={`Cobrado: ${formatClp(c.paid)}`} loading={loading} />
      </div>

      <div className="grid gap-5 md:gap-6 xl:grid-cols-5">
        <Panel title="Estado de resultados" description="Del periodo seleccionado" className="xl:col-span-2">
          <Row label="Ventas brutas" value={c.grossSales} />
          <Row label="Descuentos y cupones" value={c.discounts} negative />
          <Row label="Ventas netas" value={c.netSales} />
          <Row label="Costo de productos" value={c.cogs} negative note={incomplete ? `Cobertura de costos: ${formatPct(c.costCoverage, 0)}` : undefined} />
          <Row label="Utilidad bruta" value={c.grossProfit} />
          <Row label="Comisión de la plataforma" value={c.marketplaceFee} negative />
          <Row label="Comisión de pago (estimada)" value={c.paymentFee} negative note="Ajusta la tasa en Costos" />
          <Row label="Utilidad neta" value={c.netProfit} strong />
          <p className="mt-3 text-xs text-muted-foreground">
            Los envíos cobrados ({formatClp(c.shippingCollected)}) se tratan como traspaso al courier y no se cuentan como ingreso ni utilidad.
          </p>
        </Panel>

        <Panel title="Últimos 6 meses" description="Ventas netas, costos y utilidad" className="xl:col-span-3">
          {report.monthly.every((m) => m.netSales === 0) && !loading ? <EmptyNote>Aún no hay datos mensuales.</EmptyNote> : <MonthlyProfitChart data={report.monthly} />}
        </Panel>
      </div>

      <Panel title="Rentabilidad por producto" description="Utilidad estimada después de costo y comisiones" bodyClassName="p-0 md:p-0">
        {report.byProduct.length === 0 ? <EmptyNote>Sin ventas en este periodo.</EmptyNote> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium md:px-5">Producto</th><th className="px-3 py-2.5 text-right font-medium">Unid.</th>
                <th className="px-3 py-2.5 text-right font-medium">Ventas netas</th><th className="px-3 py-2.5 text-right font-medium">Utilidad</th><th className="px-4 py-2.5 text-right font-medium md:px-5">Margen</th>
              </tr></thead>
              <tbody>
                {report.byProduct.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="max-w-[16rem] truncate px-4 py-3 font-medium md:px-5">{r.name}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.units}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatClp(r.netSales)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.costKnown ? formatClp(r.profit) : <span className="text-muted-foreground">sin costo</span>}</td>
                    <td className="px-4 py-3 text-right tabular-nums md:px-5">{r.costKnown ? formatPct(r.margin) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
