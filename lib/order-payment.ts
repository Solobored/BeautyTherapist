import { supabaseServer } from '@/lib/supabase'
import { decrementStockForOrderLines, type OrderLineJson } from '@/lib/order-stock'
import { sendOrderConfirmedToBuyer } from '@/lib/email'
import type { PaymentResponse } from '@/lib/mercadopago'

type OrderRow = {
  id: string
  buyer_name: string
  buyer_email: string
  total: number
  items: unknown
  payment_status: string
}

type OrderItem = {
  product_name?: string
  name?: string
  quantity?: number
  price?: number
}

export async function applyApprovedPaymentToOrder(orderId: string, payment: PaymentResponse) {
  const { data: updatedRows, error: upErr } = await supabaseServer
    .from('orders')
    .update({
      payment_status: 'completed',
      order_status: 'processing',
      mercadopago_payment_id: String(payment.id),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('payment_status', 'pending')
    .select('id, buyer_name, buyer_email, total, items, payment_status')

  if (upErr) {
    console.error('orders update payment', upErr)
    return { ok: false as const, changed: false as const }
  }

  const updated = updatedRows?.[0] as OrderRow | undefined
  if (updated) {
    if (updated.items) {
      await decrementStockForOrderLines(updated.items as OrderLineJson[])
    }

    const items = Array.isArray(updated.items) ? (updated.items as OrderItem[]) : []
    await sendOrderConfirmedToBuyer({
      to: updated.buyer_email,
      buyerName: updated.buyer_name,
      orderId: updated.id,
      items: items.map((item) => ({
        name: item.product_name ?? item.name ?? 'Producto',
        quantity: Number(item.quantity ?? 1),
        price: Number(item.price ?? 0),
      })),
      total: Number(updated.total ?? 0),
    })
  }

  return { ok: true as const, changed: Boolean(updated), order: updated }
}

export async function applyRejectedPaymentToOrder(orderId: string, paymentId: string) {
  const { error } = await supabaseServer
    .from('orders')
    .update({
      payment_status: 'failed',
      mercadopago_payment_id: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('payment_status', 'pending')

  if (error) {
    console.error('orders reject payment', error)
    return { ok: false as const }
  }

  return { ok: true as const }
}
