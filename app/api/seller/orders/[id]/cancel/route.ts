import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { resolveBrandIdForSeller } from '@/lib/seller-server'
import { createRefund } from '@/lib/mercadopago'
import { incrementStockForOrderLines, type OrderLineJson } from '@/lib/order-stock'
import { sendOrderCancelledToBuyer } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await ctx.params
  const email = request.headers.get('x-seller-email')?.trim() ?? ''
  const slug = request.headers.get('x-brand-slug')?.trim() ?? ''
  if (!email) {
    return NextResponse.json({ error: 'Missing x-seller-email header' }, { status: 400 })
  }

  let reason = ''
  try {
    const j = (await request.json()) as { reason?: string }
    reason = typeof j?.reason === 'string' ? j.reason.slice(0, 500) : ''
  } catch {
    /* body opcional */
  }

  const brandId = await resolveBrandIdForSeller(supabaseServer, email, slug || undefined)
  if (!brandId) {
    return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
  }

  const { data: brandProducts } = await supabaseServer.from('products').select('id').eq('brand_id', brandId)
  const productIds = new Set((brandProducts ?? []).map((p) => p.id))

  const { data: order, error: oErr } = await supabaseServer.from('orders').select('*').eq('id', orderId).single()
  if (oErr || !order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  const items = (order.items ?? []) as { product_id?: string }[]
  const touchesBrand = items.some((i) => i.product_id && productIds.has(i.product_id))
  if (!touchesBrand) {
    return NextResponse.json({ error: 'Este pedido no incluye productos de tu marca' }, { status: 403 })
  }

  if (order.order_status === 'cancelled') {
    return NextResponse.json({ error: 'El pedido ya está cancelado' }, { status: 400 })
  }

  const mpPaymentId =
    (order as { mercadopago_payment_id?: string | null }).mercadopago_payment_id ?? null

  let refunded = false

  if (order.payment_status === 'completed' && mpPaymentId) {
    try {
      const ref = await createRefund(String(mpPaymentId))
      refunded = true
      await supabaseServer
        .from('orders')
        .update({
          payment_status: 'cancelled',
          order_status: 'cancelled',
          mercadopago_refund_id: String(ref.id),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      await incrementStockForOrderLines(order.items as OrderLineJson[])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al reembolsar en Mercado Pago'
      return NextResponse.json({ error: msg }, { status: 502 })
    }
  } else {
    await supabaseServer
      .from('orders')
      .update({
        payment_status: 'cancelled',
        order_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
  }

  await sendOrderCancelledToBuyer({
    to: order.buyer_email,
    buyerName: order.buyer_name,
    orderId: order.id,
    refunded,
    reason: reason || undefined,
  })

  return NextResponse.json({ ok: true, refunded })
}
