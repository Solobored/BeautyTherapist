import { NextRequest, NextResponse } from 'next/server'
import { getPayment } from '@/lib/mercadopago'
import { supabaseServer } from '@/lib/supabase'
import { applyApprovedPaymentToOrder, applyRejectedPaymentToOrder } from '@/lib/order-payment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      orderId?: string
      paymentId?: string
    }

    const orderId = body.orderId?.trim()
    const paymentId = body.paymentId?.trim()

    if (!orderId) {
      return NextResponse.json({ error: 'Falta el identificador del pedido.' }, { status: 400 })
    }

    const { data: order, error } = await supabaseServer
      .from('orders')
      .select('id, payment_status, order_status, mercadopago_payment_id')
      .eq('id', orderId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 })
    }

    if (String(order.payment_status).toLowerCase() === 'completed') {
      return NextResponse.json({
        ok: true,
        status: 'approved',
        alreadyConfirmed: true,
      })
    }

    if (!paymentId && !(order as { mercadopago_payment_id?: string | null }).mercadopago_payment_id) {
      return NextResponse.json({
        ok: true,
        status: String(order.payment_status || 'pending').toLowerCase(),
      })
    }

    const payment = await getPayment(paymentId || String((order as { mercadopago_payment_id?: string | null }).mercadopago_payment_id))
    const paymentOrderId = payment.external_reference || payment.metadata?.order_id

    if (paymentOrderId && paymentOrderId !== orderId) {
      return NextResponse.json({ error: 'El pago no coincide con el pedido.' }, { status: 400 })
    }

    if (payment.status === 'approved') {
      await applyApprovedPaymentToOrder(orderId, payment)
      return NextResponse.json({ ok: true, status: 'approved' })
    }

    if (payment.status === 'rejected' || payment.status === 'cancelled') {
      await applyRejectedPaymentToOrder(orderId, String(payment.id))
      return NextResponse.json({ ok: true, status: payment.status })
    }

    return NextResponse.json({ ok: true, status: payment.status })
  } catch (error) {
    console.error('checkout confirm', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al confirmar el pedido.' },
      { status: 500 }
    )
  }
}
