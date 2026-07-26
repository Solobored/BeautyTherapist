const { normalizeBuyerOrderStatus, shouldShowOrderInSellerDashboard } = require('../lib/order-visibility.js')

describe('order visibility helpers', () => {
  it('keeps pending orders visible in the seller dashboard', () => {
    expect(
      shouldShowOrderInSellerDashboard({
        order_status: 'pending',
        payment_status: 'pending',
      })
    ).toBe(true)
  })

  it('keeps processing orders visible in the seller dashboard', () => {
    expect(
      shouldShowOrderInSellerDashboard({
        order_status: 'processing',
        payment_status: 'pending',
      })
    ).toBe(true)
  })

  it('maps processing payments to a pending buyer status', () => {
    expect(normalizeBuyerOrderStatus('processing', 'pending')).toBe('pending')
  })
})
