'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { sellerApiHeaders } from '@/hooks/use-seller-products'
import { computeFinance, periodRange, type FinanceOrderRow, type ProductCosts } from '@/lib/seller-finance'

export type PeriodDays = 7 | 30 | 90 | 365
export const PERIOD_OPTIONS: { value: PeriodDays; label: string }[] = [
  { value: 7, label: 'Últimos 7 días' },
  { value: 30, label: 'Últimos 30 días' },
  { value: 90, label: 'Últimos 90 días' },
  { value: 365, label: 'Últimos 12 meses' },
]

export type SellerOrder = FinanceOrderRow & {
  buyerName: string
  items: { productId?: string; name: string; quantity: number; price: number }[]
}

const FEE_KEY = 'bt-seller-payment-fee-rate'
const PERIOD_KEY = 'bt-seller-period'
export const DEFAULT_PAYMENT_FEE = 0.035

const read = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* storage bloqueado */ } }

export function useSellerFinance(seller: { email: string; brandName: string } | undefined) {
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [productCosts, setProductCosts] = useState<ProductCosts>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriodState] = useState<PeriodDays>(30)
  const [paymentFeeRate, setFeeState] = useState(DEFAULT_PAYMENT_FEE)

  useEffect(() => {
    const p = Number(read(PERIOD_KEY))
    if ([7, 30, 90, 365].includes(p)) setPeriodState(p as PeriodDays)
    const f = Number(read(FEE_KEY))
    if (read(FEE_KEY) !== null && Number.isFinite(f) && f >= 0 && f < 0.2) setFeeState(f)
  }, [])

  const setPeriod = (p: PeriodDays) => { setPeriodState(p); write(PERIOD_KEY, String(p)) }
  const setPaymentFeeRate = (f: number) => {
    const safe = Math.min(0.2, Math.max(0, f))
    setFeeState(safe)
    write(FEE_KEY, String(safe))
  }

  const reload = useCallback(async () => {
    if (!seller?.email) return
    try {
      const res = await fetch('/api/seller/orders', { headers: sellerApiHeaders(seller), cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudieron cargar los pedidos')
      setOrders(
        ((json.orders ?? []) as any[]).map((o) => ({
          id: o.id,
          buyerName: o.buyerName,
          buyerEmail: o.buyerEmail,
          items: o.items ?? [],
          subtotal: o.subtotal,
          shippingCost: o.shippingCost,
          discount: o.discount,
          total: o.total,
          orderStatus: o.orderStatus,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
          marketplaceFee: o.marketplaceFee ?? null,
          shippingAddress: o.shippingAddress ?? null,
        }))
      )
      setProductCosts(json.productCosts ?? {})
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [seller])

  // Carga inicial + refresco cada 3 min y al volver a la pestaña (igual que el dashboard anterior).
  useEffect(() => {
    if (!seller?.email) return
    void reload()
    const id = window.setInterval(() => document.visibilityState === 'visible' && void reload(), 3 * 60 * 1000)
    const onVis = () => document.visibilityState === 'visible' && void reload()
    document.addEventListener('visibilitychange', onVis)
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [seller?.email, reload])

  const report = useMemo(() => {
    const { from, to } = periodRange(period)
    return computeFinance(orders, productCosts, { paymentFeeRate, from, to })
  }, [orders, productCosts, period, paymentFeeRate])

  return { orders, productCosts, loading, error, reload, report, period, setPeriod, paymentFeeRate, setPaymentFeeRate }
}

export type SellerFinance = ReturnType<typeof useSellerFinance>
