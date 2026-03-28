/**
 * Métricas de vendedor a partir de filas de pedidos que incluyen productos de la marca.
 * Excluye pedidos cancelados. Reparte el total del pedido proporcionalmente al subtotal
 * de las líneas de la marca (cuando el carrito mezcla marcas).
 */

export type OrderItemJson = {
  product_id?: string
  product_name?: string
  name?: string
  quantity?: number
  price?: number
}

export type OrderRowForAnalytics = {
  id: string
  items: OrderItemJson[] | null
  subtotal: number
  total: number
  order_status: string
  created_at: string
}

export type ProductCategoryRow = { id: string; category: string }

export type SellerOrderAnalytics = {
  totalRevenue: number
  totalSales: number
  /** Mes calendario actual (atribuido a la marca). */
  revenueThisMonth: number
  salesThisMonth: number
  /** Mes calendario anterior. */
  totalRevenueLastMonth: number
  totalSalesLastMonth: number
  revenueByMonth: { month: string; revenue: number }[]
  salesByCategory: { category: string; revenue: number }[]
}

const MONTH_LABELS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function isCancelled(order: OrderRowForAnalytics): boolean {
  return order.order_status === 'cancelled'
}

function lineAmount(i: OrderItemJson): number {
  const q = Math.max(1, Math.floor(Number(i.quantity ?? 1)))
  const p = Number(i.price ?? 0)
  return Math.round(p * q)
}

/** Ingreso atribuido a la marca en este pedido (0 si cancelado o sin líneas). */
export function attributedSellerRevenue(
  order: OrderRowForAnalytics,
  productIds: Set<string>
): { attributed: number; lineSubtotal: number } {
  if (isCancelled(order)) return { attributed: 0, lineSubtotal: 0 }
  const items = (order.items ?? []) as OrderItemJson[]
  const relevant = items.filter((i) => i.product_id && productIds.has(i.product_id))
  const lineSubtotal = relevant.reduce((s, i) => s + lineAmount(i), 0)
  if (lineSubtotal <= 0) return { attributed: 0, lineSubtotal: 0 }
  const subtotal = Number(order.subtotal) || 0
  const total = Number(order.total) || 0
  if (subtotal <= 0) {
    return { attributed: Math.round(total), lineSubtotal }
  }
  const fraction = lineSubtotal / subtotal
  return { attributed: Math.round(total * fraction), lineSubtotal }
}

function categoryLabel(raw: string): string {
  const c = raw.toLowerCase()
  if (c === 'skincare') return 'Skincare'
  if (c === 'makeup') return 'Maquillaje'
  return raw || 'Otro'
}

function monthKey(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}`
}

function last6MonthSlots(): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = d.getMonth()
    const key = `${y}-${String(m + 1).padStart(2, '0')}`
    const label = `${MONTH_LABELS_ES[m]} ${String(y).slice(2)}`
    out.push({ key, label })
  }
  return out
}

export function computeSellerOrderAnalytics(
  orders: OrderRowForAnalytics[],
  productIds: Set<string>,
  productsById: Map<string, { category: string }>
): SellerOrderAnalytics {
  const now = new Date()
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  let totalRevenue = 0
  let totalSales = 0
  let revenueThisMonth = 0
  let salesThisMonth = 0
  let totalRevenueLastMonth = 0
  let totalSalesLastMonth = 0

  const monthTotals = new Map<string, number>()
  const categoryTotals = new Map<string, number>()

  for (const order of orders) {
    const items = (order.items ?? []) as OrderItemJson[]
    const touches = items.some((i) => i.product_id && productIds.has(i.product_id))
    if (!touches) continue

    if (isCancelled(order)) continue

    const { attributed, lineSubtotal } = attributedSellerRevenue(order, productIds)
    if (lineSubtotal <= 0) continue

    totalRevenue += attributed
    totalSales += 1

    const created = new Date(order.created_at)
    if (created >= startThisMonth) {
      revenueThisMonth += attributed
      salesThisMonth += 1
    }
    if (created >= startPrevMonth && created <= endPrevMonth) {
      totalRevenueLastMonth += attributed
      totalSalesLastMonth += 1
    }

    const mk = monthKey(order.created_at)
    monthTotals.set(mk, (monthTotals.get(mk) ?? 0) + attributed)

    const relevant = items.filter((i) => i.product_id && productIds.has(i.product_id))
    for (const i of relevant) {
      const line = lineAmount(i)
      if (line <= 0) continue
      const lineAttributed =
        lineSubtotal > 0 ? Math.round((line / lineSubtotal) * attributed) : 0
      const catRaw = productsById.get(i.product_id!)?.category ?? 'other'
      const label = categoryLabel(catRaw)
      categoryTotals.set(label, (categoryTotals.get(label) ?? 0) + lineAttributed)
    }
  }

  const slots = last6MonthSlots()
  const revenueByMonth = slots.map(({ key, label }) => ({
    month: label,
    revenue: monthTotals.get(key) ?? 0,
  }))

  const salesByCategory = Array.from(categoryTotals.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  return {
    totalRevenue,
    totalSales,
    revenueThisMonth,
    salesThisMonth,
    totalRevenueLastMonth,
    totalSalesLastMonth,
    revenueByMonth,
    salesByCategory,
  }
}
