'use client'

import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { formatClp } from '@/lib/utils'
import { formatCompactClp } from './format'

/** Colores del tema (las variables del proyecto son hex, no HSL). */
export const C = {
  sales: 'var(--accent)',
  salesSoft: 'var(--primary)',
  costs: '#C9B8A6',
  profit: '#2F8F6B',
  grid: 'var(--border)',
  axis: 'var(--muted-foreground)',
}

const tooltipStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  fontSize: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,.08)',
}

const axisProps = { stroke: C.axis, fontSize: 11, tickLine: false, axisLine: false } as const

/** Ventas netas por día; si el periodo es largo (> 90 días) se agrupa por semana para que sea legible. */
export function SalesAreaChart({
  data, height = 260,
}: { data: { label: string; netSales: number }[]; height?: number }) {
  const series = data.length > 90
    ? Array.from({ length: Math.ceil(data.length / 7) }, (_, i) => {
        const chunk = data.slice(i * 7, i * 7 + 7)
        return { label: `Sem. ${chunk[0].label}`, netSales: chunk.reduce((s, d) => s + d.netSales, 0) }
      })
    : data
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={C.grid} strokeDasharray="3 3" />
        <XAxis dataKey="label" {...axisProps} minTickGap={28} />
        <YAxis {...axisProps} width={68} tickFormatter={formatCompactClp} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)', opacity: 0.5 }} formatter={(v: number) => [formatClp(v), 'Ventas netas']} />
        <Bar dataKey="netSales" name="Ventas netas" fill="#9B7EC8" radius={[3, 3, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function MonthlyProfitChart({
  data, height = 280,
}: { data: { label: string; netSales: number; costs: number; profit: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid vertical={false} stroke={C.grid} strokeDasharray="3 3" />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={68} tickFormatter={formatCompactClp} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
          formatter={(v: number, name: string) => [formatClp(v), name]}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="netSales" name="Ventas netas" fill="#9B7EC8" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="costs" name="Costos y comisiones" fill={C.costs} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="profit" name="Utilidad" fill={C.profit} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
