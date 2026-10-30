import { computeFinance, pctChange, periodRange, type FinanceOrderRow } from '@/lib/seller-finance'

const now = new Date(2026, 9, 29, 12) // 29-oct-2026
const range = periodRange(30, now)
const opts = { paymentFeeRate: 0.03, marketplaceRate: 0.005, ...range, now }
const day = (d: number) => new Date(2026, 9, d, 10).toISOString()

const base = (o: Partial<FinanceOrderRow>): FinanceOrderRow => ({
  id: 'o1', items: [{ productId: 'a', name: 'A', quantity: 2, price: 10000 }],
  subtotal: 20000, shippingCost: 4000, discount: 0, total: 24000,
  orderStatus: 'delivered', paymentStatus: 'completed', createdAt: day(20), ...o,
})

describe('computeFinance', () => {
  it('calcula ventas netas, costos y utilidad', () => {
    const r = computeFinance([base({ marketplaceFee: 120 })], { a: 4000 }, opts)
    expect(r.current.grossSales).toBe(20000)
    expect(r.current.netSales).toBe(20000)
    expect(r.current.shippingCollected).toBe(4000)
    expect(r.current.cogs).toBe(8000)
    expect(r.current.marketplaceFee).toBe(120)
    expect(r.current.paymentFee).toBe(720) // 3 % de 24.000
    expect(r.current.netProfit).toBe(20000 - 8000 - 120 - 720)
    expect(r.current.costCoverage).toBe(1)
  })

  it('reparte descuento y envío solo a las líneas de la marca en carritos mixtos', () => {
    const mixed = base({
      items: [
        { productId: 'a', quantity: 1, price: 10000 },
        { productId: undefined, name: 'otra marca', quantity: 1, price: 30000 },
      ],
      subtotal: 40000, shippingCost: 4000, discount: 4000, total: 40000,
    })
    const r = computeFinance([mixed], {}, opts)
    expect(r.current.grossSales).toBe(10000)
    expect(r.current.discounts).toBe(1000)
    expect(r.current.netSales).toBe(9000)
    expect(r.current.shippingCollected).toBe(1000)
  })

  it('excluye cancelados y separa cobrado de por cobrar', () => {
    const r = computeFinance([
      base({ id: 'x1' }),
      base({ id: 'x2', paymentStatus: 'pending' }),
      base({ id: 'x3', orderStatus: 'cancelled' }),
    ], {}, opts)
    expect(r.current.orders).toBe(2)
    expect(r.current.paid).toBe(24000)
    expect(r.current.receivable).toBe(24000)
    expect(r.current.cancelledCount).toBe(1)
  })

  it('no trata un costo faltante como 0 y reporta cobertura', () => {
    const r = computeFinance([base({})], {}, opts)
    expect(r.current.costCoverage).toBe(0)
    expect(r.byProduct[0].costKnown).toBe(false)
  })

  it('compara contra el periodo anterior de igual duración', () => {
    const r = computeFinance([base({ id: 'n', createdAt: day(20) }), base({ id: 'p', createdAt: new Date(2026, 8, 10).toISOString() })], {}, opts)
    expect(r.current.orders).toBe(1)
    expect(r.previous.orders).toBe(1)
    expect(pctChange(r.current.netSales, r.previous.netSales)).toBe(0)
    expect(pctChange(100, 0)).toBeNull()
  })

  it('genera 6 meses y serie diaria', () => {
    const r = computeFinance([base({})], {}, opts)
    expect(r.monthly).toHaveLength(6)
    expect(r.daily).toHaveLength(30)
  })
})
