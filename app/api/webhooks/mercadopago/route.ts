import { NextRequest, NextResponse } from 'next/server'
import { getPayment, verifyWebhookSignature } from '@/lib/mercadopago'
import { supabaseServer } from '@/lib/supabase'
import { decrementStockForOrderLines, type OrderLineJson } from '@/lib/order-stock'

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
        .select('items')

      if (upErr) console.error('orders update webhook', upErr)

      const claim = updatedRows?.[0]
      if (claim?.items) {
        await decrementStockForOrderLines(claim.items as OrderLineJson[])
      }

      return NextResponse.json({ ok: true })
    }

    if (payment.status === 'rejected' || payment.status === 'cancelled') {
      await supabaseServer
        .from('orders')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('payment_status', 'pending')

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
