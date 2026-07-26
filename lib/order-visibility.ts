export type OrderVisibilityRow = {
  order_status?: string | null
  payment_status?: string | null
}

export function shouldShowOrderInSellerDashboard(order: OrderVisibilityRow): boolean {
  const paymentStatus = String(order.payment_status || '').toLowerCase()
  const orderStatus = String(order.order_status || '').toLowerCase()

  if (paymentStatus === 'completed' || paymentStatus === 'pending' || paymentStatus === 'in_process') return true

  return ['pending', 'processing', 'shipped', 'delivered'].includes(orderStatus)
}

export function normalizeBuyerOrderStatus(orderStatus?: string | null, paymentStatus?: string | null): string {
  const normalizedOrder = String(orderStatus || '').toLowerCase()
  const normalizedPayment = String(paymentStatus || '').toLowerCase()

  if (normalizedPayment === 'completed' || normalizedPayment === 'pending' || normalizedPayment === 'in_process') {
    return normalizedOrder === 'processing' ? 'pending' : normalizedOrder
  }

  if (normalizedOrder === 'processing') {
    return 'pending'
  }

  return normalizedOrder || 'pending'
}
