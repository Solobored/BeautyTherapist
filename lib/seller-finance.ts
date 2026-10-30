/**
 * Cálculo financiero del vendedor (CLP). Funciones puras, sin dependencias de React ni de Supabase,
 * para poder probarlas con Jest y reutilizarlas en cliente o servidor.
 *
 * Definiciones (todas atribuidas SOLO a las líneas de la marca cuando el carrito mezcla marcas):
 *  - Ventas brutas  = Σ precio × cantidad
 *  - Descuentos     = parte proporcional del descuento del pedido
 *  - Ventas netas   = ventas brutas − descuentos
 *  - Envío cobrado  = parte proporcional del envío (se trata como traspaso, no es utilidad)
 *  - Comisión plataforma = mercadopago_marketplace_fee guardado en el pedido (o tasa × cobrado)
 *  - Comisión de pago    = tasa configurable × cobrado (estimación)
 *  - Costo de producto   = Σ cantidad × costo unitario (products.cost_price)
 *  - Utilidad neta  = ventas netas − costo de producto − comisiones
 */

export type FinanceOrderItem = {
  productId?: string
  name?: string
  quantity?: number
  price?: number
}

export type FinanceOrderRow = {
  id: string
  buyerEmail?: string
  items: FinanceOrderItem[]
  /** Subtotal del pedido completo (todas las marcas). */
  subtotal?: number
  shippingCost?: number
  discount?: number
  total: number
  orderStatus: string
  paymentStatus?: string
  createdAt: string
  /** CLP retenidos por la plataforma en el pedido completo. */
  marketplaceFee?: number | null
  shippingAddress?: Record<string, any> | null
}

export type ProductCosts = Record<string, number | null | undefined>

export type FinanceOptions = {
  /** Tasa estimada de procesamiento de pagos, ej. 0.035 = 3,5 %. */
  paymentFeeRate: number
  /** Tasa de la plataforma si el pedido no trae la comisión real. */
  marketplaceRate?: number
  from: Date
  to: Date
  now?: Date
}

export type FinanceTotals = {
  orders: number
  units: number
  grossSales: number
  discounts: number
  netSales: number
  shippingCollected: number
  collected: number
  marketplaceFee: number
  paymentFee: number
  cogs: number
  /** % de unidades vendidas con costo cargado (0–1). */
  costCoverage: number
  grossProfit: number
  netProfit: number
  /** utilidad neta / ventas netas (0–1). */
  margin: number
  /** Ticket promedio (cobrado / pedidos). */
  aov: number
  paid: number
  receivable: number
  cancelledCount: number
  cancelledValue: number
}

export type ProductFinanceRow = {
  id: string
  name: string
  units: number
  netSales: number
  cogs: number
  profit: number
  margin: number
  costKnown: boolean
}

export type FinanceReport = {
  current: FinanceTotals
  previous: FinanceTotals
  daily: { date: string; label: string; netSales: number; orders: number }[]
  monthly: { key: string; label: string; netSales: number; costs: number; profit: number }[]
  byProduct: ProductFinanceRow[]
  byStatus: { status: string; count: number }[]
  topCities: { city: string; orders: number; netSales: number }[]
  customers: { unique: number; returning: number; returningRate: number }
  costBreakdown: { key: 'cogs' | 'marketplace' | 'payment' | 'discounts'; label: string; value: number }[]
}

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const lineAmount = (i: FinanceOrderItem) =>
  Math.round(Number(i.price ?? 0) * Math.max(1, Math.floor(Number(i.quantity ?? 1))))
const qtyOf = (i: FinanceOrderItem) => Math.max(1, Math.floor(Number(i.quantity ?? 1)))

type OrderCalc = {
  id: string
  date: Date
  cancelled: boolean
  paid: boolean
  lines: { id?: string; name: string; qty: number; gross: number; net: number }[]
  gross: number
  discount: number
  net: number
  shipping: number
  collected: number
  marketplaceFee: number
  city: string
  email: string
}

function calcOrder(o: FinanceOrderRow, marketplaceRate: number): OrderCalc | null {
  const lines = o.items.filter((i) => i.productId)
  const gross = lines.reduce((s, i) => s + lineAmount(i), 0)
  if (gross <= 0) return null

  const orderSubtotal = Number(o.subtotal) > 0 ? Number(o.subtotal) : gross
  const fraction = Math.min(1, gross / orderSubtotal)
  const discount = Math.round(Number(o.discount ?? 0) * fraction)
  const shipping = Math.round(Number(o.shippingCost ?? 0) * fraction)
  const net = gross - discount
  const collected = net + shipping
  const realFee = o.marketplaceFee != null ? Number(o.marketplaceFee) : null
  const marketplaceFee =
    realFee != null && Number.isFinite(realFee) ? Math.round(realFee * fraction) : Math.round(collected * marketplaceRate)

  return {
    id: o.id,
    date: new Date(o.createdAt),
    cancelled: o.orderStatus === 'cancelled',
    paid: o.paymentStatus === 'completed',
    lines: lines.map((i) => {
      const g = lineAmount(i)
      return {
        id: i.productId,
        name: i.name ?? 'Producto',
        qty: qtyOf(i),
        gross: g,
        net: Math.round(g - discount * (g / gross)),
      }
    }),
    gross,
    discount,
    net,
    shipping,
    collected,
    marketplaceFee,
    city: String(o.shippingAddress?.city ?? '').trim(),
    email: (o.buyerEmail ?? '').trim().toLowerCase(),
  }
}

function emptyTotals(): FinanceTotals {
  return {
    orders: 0, units: 0, grossSales: 0, discounts: 0, netSales: 0, shippingCollected: 0, collected: 0,
    marketplaceFee: 0, paymentFee: 0, cogs: 0, costCoverage: 0, grossProfit: 0, netProfit: 0, margin: 0,
    aov: 0, paid: 0, receivable: 0, cancelledCount: 0, cancelledValue: 0,
  }
}

function totalsFor(calcs: OrderCalc[], costs: ProductCosts, paymentFeeRate: number): FinanceTotals {
  const t = emptyTotals()
  let unitsWithCost = 0
  for (const c of calcs) {
    if (c.cancelled) {
      t.cancelledCount += 1
      t.cancelledValue += c.collected
      continue
    }
    t.orders += 1
    t.grossSales += c.gross
    t.discounts += c.discount
    t.netSales += c.net
    t.shippingCollected += c.shipping
    t.collected += c.collected
    t.marketplaceFee += c.marketplaceFee
    t.paymentFee += Math.round(c.collected * paymentFeeRate)
    if (c.paid) t.paid += c.collected
    else t.receivable += c.collected
    for (const l of c.lines) {
      t.units += l.qty
      const unit = l.id ? costs[l.id] : null
      if (unit != null && Number.isFinite(Number(unit))) {
        t.cogs += Math.round(Number(unit) * l.qty)
        unitsWithCost += l.qty
      }
    }
  }
  t.costCoverage = t.units > 0 ? unitsWithCost / t.units : 0
  t.grossProfit = t.netSales - t.cogs
  t.netProfit = t.grossProfit - t.marketplaceFee - t.paymentFee
  t.margin = t.netSales > 0 ? t.netProfit / t.netSales : 0
  t.aov = t.orders > 0 ? Math.round(t.collected / t.orders) : 0
  return t
}

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function computeFinance(
  orders: FinanceOrderRow[],
  costs: ProductCosts,
  opts: FinanceOptions
): FinanceReport {
  const marketplaceRate = opts.marketplaceRate ?? 0.005
  const now = opts.now ?? new Date()
  const calcs = orders.map((o) => calcOrder(o, marketplaceRate)).filter((c): c is OrderCalc => c !== null)

  const span = opts.to.getTime() - opts.from.getTime()
  const prevFrom = new Date(opts.from.getTime() - span - 1)
  const prevTo = new Date(opts.from.getTime() - 1)

  const inRange = (c: OrderCalc, a: Date, b: Date) => c.date >= a && c.date <= b
  const cur = calcs.filter((c) => inRange(c, opts.from, opts.to))
  const prev = calcs.filter((c) => inRange(c, prevFrom, prevTo))
  const current = totalsFor(cur, costs, opts.paymentFeeRate)
  const previous = totalsFor(prev, costs, opts.paymentFeeRate)

  // Serie diaria dentro del periodo
  const dayMap = new Map<string, { netSales: number; orders: number }>()
  const cursor = new Date(opts.from.getFullYear(), opts.from.getMonth(), opts.from.getDate())
  const lastDay = new Date(opts.to.getFullYear(), opts.to.getMonth(), opts.to.getDate())
  while (cursor <= lastDay) {
    dayMap.set(dayKey(cursor), { netSales: 0, orders: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  for (const c of cur) {
    if (c.cancelled) continue
    const row = dayMap.get(dayKey(c.date))
    if (row) {
      row.netSales += c.net
      row.orders += 1
    }
  }
  const daily = Array.from(dayMap.entries()).map(([date, v]) => {
    const [, m, d] = date.split('-')
    return { date, label: `${Number(d)} ${MONTHS_ES[Number(m) - 1]}`, ...v }
  })

  // Serie mensual (últimos 6 meses, independiente del filtro)
  const monthly: FinanceReport['monthly'] = []
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
    const t = totalsFor(calcs.filter((c) => inRange(c, start, end)), costs, opts.paymentFeeRate)
    monthly.push({
      key: `${start.getFullYear()}-${start.getMonth() + 1}`,
      label: `${MONTHS_ES[start.getMonth()]} ${String(start.getFullYear()).slice(2)}`,
      netSales: t.netSales,
      costs: t.cogs + t.marketplaceFee + t.paymentFee,
      profit: t.netProfit,
    })
  }

  // Por producto
  const prodMap = new Map<string, ProductFinanceRow>()
  for (const c of cur) {
    if (c.cancelled) continue
    for (const l of c.lines) {
      const key = l.id ?? l.name
      const unit = l.id ? costs[l.id] : null
      const known = unit != null && Number.isFinite(Number(unit))
      const row = prodMap.get(key) ?? { id: key, name: l.name, units: 0, netSales: 0, cogs: 0, profit: 0, margin: 0, costKnown: true }
      row.units += l.qty
      row.netSales += l.net
      if (known) row.cogs += Math.round(Number(unit) * l.qty)
      else row.costKnown = false
      prodMap.set(key, row)
    }
  }
  const byProduct = Array.from(prodMap.values())
    .map((r) => {
      const fees = r.netSales * (opts.paymentFeeRate + marketplaceRate)
      const profit = Math.round(r.netSales - r.cogs - fees)
      return { ...r, profit, margin: r.netSales > 0 ? profit / r.netSales : 0 }
    })
    .sort((a, b) => b.netSales - a.netSales)

  // Estados
  const statusMap = new Map<string, number>()
  for (const c of cur) {
    // reconstruimos el estado desde el pedido original
    const src = orders.find((o) => o.id === c.id)
    const s = src?.orderStatus ?? 'pending'
    statusMap.set(s, (statusMap.get(s) ?? 0) + 1)
  }
  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }))

  // Ciudades
  const cityMap = new Map<string, { orders: number; netSales: number }>()
  for (const c of cur) {
    if (c.cancelled || !c.city) continue
    const row = cityMap.get(c.city) ?? { orders: 0, netSales: 0 }
    row.orders += 1
    row.netSales += c.net
    cityMap.set(c.city, row)
  }
  const topCities = Array.from(cityMap.entries())
    .map(([city, v]) => ({ city, ...v }))
    .sort((a, b) => b.netSales - a.netSales)
    .slice(0, 5)

  // Clientes recurrentes (todo el historial cargado)
  const perEmail = new Map<string, number>()
  for (const c of calcs) {
    if (c.cancelled || !c.email) continue
    perEmail.set(c.email, (perEmail.get(c.email) ?? 0) + 1)
  }
  const unique = perEmail.size
  const returning = Array.from(perEmail.values()).filter((n) => n > 1).length

  const costBreakdown: FinanceReport['costBreakdown'] = [
    { key: 'cogs', label: 'Costo de productos', value: current.cogs },
    { key: 'marketplace', label: 'Comisión plataforma', value: current.marketplaceFee },
    { key: 'payment', label: 'Comisión de pago (est.)', value: current.paymentFee },
    { key: 'discounts', label: 'Descuentos y cupones', value: current.discounts },
  ]

  return {
    current,
    previous,
    daily,
    monthly,
    byProduct,
    byStatus,
    topCities,
    customers: { unique, returning, returningRate: unique > 0 ? returning / unique : 0 },
    costBreakdown,
  }
}

/** Variación porcentual; null si no hay base de comparación. */
export function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? null : 0
  return ((current - previous) / previous) * 100
}

export function periodRange(days: number, now = new Date()): { from: Date; to: Date } {
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1), 0, 0, 0, 0)
  return { from, to }
}
