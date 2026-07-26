function shouldShowOrderInSellerDashboard(order) {
  const paymentStatus = String(order.payment_status || '').toLowerCase()
  const orderStatus = String(order.order_status || '').toLowerCase()

  if (paymentStatus === 'completed') return true

  return ['pending', 'processing', 'shipped', 'delivered'].includes(orderStatus)
}

function normalizeBuyerOrderStatus(orderStatus, paymentStatus) {
  const normalizedOrder = String(orderStatus || '').toLowerCase()
  const normalizedPayment = String(paymentStatus || '').toLowerCase()

  if (normalizedPayment === 'completed') {
    return normalizedOrder === 'processing' ? 'pending' : normalizedOrder
  }

  if (normalizedOrder === 'processing') {
    return 'pending'
  }

  return normalizedOrder || 'pending'
}

module.exports = {
  shouldShowOrderInSellerDashboard,
  normalizeBuyerOrderStatus,
}
