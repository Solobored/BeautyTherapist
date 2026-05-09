import { NextRequest, NextResponse } from 'next/server'
import { getPayment, verifyWebhookSignature } from '@/lib/mercadopago'
import { applyApprovedPaymentToOrder, applyRejectedPaymentToOrder } from '@/lib/order-payment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type MpWebhookBody = {
  type?: string
  action?: string
  data?: { id?: string }
}

export async function POST(request: NextRequest) {
  const raw = await request.text()

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim()
  if (secret) {
    const ok = verifyWebhookSignature(
      raw,
      request.headers.get('x-signature'),
      request.headers.get('x-request-id')
    )
    if (!ok) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let body: MpWebhookBody
  try {
    body = JSON.parse(raw) as MpWebhookBody
  } catch {
    return NextResponse.json({ received: true })
  }

  const paymentId = body.data?.id
  if (!paymentId) {
    return NextResponse.json({ received: true })
  }

  if (body.type && body.type !== 'payment' && !body.action?.includes('payment')) {
    return NextResponse.json({ received: true })
  }

  try {
    const payment = await getPayment(String(paymentId))
    const orderId = payment.external_reference || payment.metadata?.order_id
    if (!orderId) {
      return NextResponse.json({ received: true })
    }

    if (payment.status === 'approved') {
      await applyApprovedPaymentToOrder(orderId, payment)
      return NextResponse.json({ ok: true })
    }

    if (payment.status === 'rejected' || payment.status === 'cancelled') {
      await applyRejectedPaymentToOrder(orderId, String(payment.id))
      return NextResponse.json({ ok: true })
    }
  } catch (e) {
    console.error('mercadopago webhook', e)
  }

  return NextResponse.json({ received: true })
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
