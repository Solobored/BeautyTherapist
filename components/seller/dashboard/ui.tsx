'use client'

import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Variación vs periodo anterior. `value` null = sin base de comparación. `inverse` = subir es malo (costos). */
export function Delta({ value, inverse = false }: { value: number | null; inverse?: boolean }) {
  if (value === null) return <span className="text-xs text-muted-foreground">Sin periodo previo</span>
  const flat = Math.abs(value) < 0.05
  const good = inverse ? value < 0 : value > 0
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums',
        flat ? 'bg-muted text-muted-foreground' : good
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
          : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
      )}
    >
      <Icon className="size-3" aria-hidden />
      {Math.abs(value).toLocaleString('es-CL', { maximumFractionDigits: 1 })}%
      <span className="sr-only">{flat ? ' sin cambios' : good ? ' mejora' : ' empeora'}</span>
    </span>
  )
}

export function KpiCard({
  label, value, delta, deltaInverse, hint, icon: Icon, loading, emphasis,
}: {
  label: string
  value: string
  delta?: number | null
  deltaInverse?: boolean
  hint?: string
  icon?: LucideIcon
  loading?: boolean
  emphasis?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-card p-4 md:p-5 shadow-xs',
        emphasis && 'border-accent/40 bg-gradient-to-br from-accent/10 to-card'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs md:text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Icon className="size-4" aria-hidden />
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-28 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-2 font-serif text-2xl md:text-[1.7rem] font-semibold leading-none tabular-nums text-foreground">{value}</p>
      )}
      <div className="mt-2.5 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1">
        {!loading && delta !== undefined && <Delta value={delta} inverse={deltaInverse} />}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  )
}

export function Panel({
  title, description, action, children, className, bodyClassName,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn('rounded-2xl border bg-card shadow-xs', className)}>
      <header className="flex flex-wrap items-start justify-between gap-2 px-4 pt-4 md:px-5 md:pt-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <div className={cn('p-4 md:p-5', bodyClassName)}>{children}</div>
    </section>
  )
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>
}

/** Barra horizontal simple con valor, para rankings (una sola tonalidad, etiqueta directa). */
export function RankBar({ label, value, display, max, sub }: { label: string; value: number; display: string; max: number; sub?: string }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0
  return (
    <li className="space-y-1">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-medium text-foreground">{label}</span>
        <span className="shrink-0 tabular-nums text-foreground">{display}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted" role="presentation">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </li>
  )
}
