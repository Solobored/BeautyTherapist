import { computeSellerOrderAnalytics } from '@/lib/seller-order-analytics'

describe('computeSellerOrderAnalytics', () => {
  const pid = 'p1'
  const productIds = new Set([pid])
  const productsById = new Map([['p1', { category: 'skincare' }]])

  it('excludes cancelled orders from revenue and sales', () => {
    const orders = [
      {
        id: 'a',
        items: [{ product_id: pid, price: 1000, quantity: 1 }],
        subtotal: 1000,
        total: 1000,
        order_status: 'cancelled',
        created_at: new Date().toISOString(),
      },
      {
        id: 'b',
        items: [{ product_id: pid, price: 500, quantity: 1 }],
        subtotal: 500,
        total: 500,
        order_status: 'pending',
        created_at: new Date().toISOString(),
      },
    ]
    const a = computeSellerOrderAnalytics(orders, productIds, productsById)
    expect(a.totalSales).toBe(1)
    expect(a.totalRevenue).toBe(500)
  })
})
