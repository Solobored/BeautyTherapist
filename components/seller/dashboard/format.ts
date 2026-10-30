export const formatCompactClp = (n: number) => {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toLocaleString('es-CL', { maximumFractionDigits: 1 })} M`
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000).toLocaleString('es-CL')} mil`
  return `${sign}$${Math.round(abs)}`
}
export const formatPct = (v: number, digits = 1) =>
  `${(v * 100).toLocaleString('es-CL', { maximumFractionDigits: digits, minimumFractionDigits: 0 })}%`

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', processing: 'En preparación', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
}
export const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  processing: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled: 'bg-muted text-muted-foreground',
}
