import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { ensureApprovedOrderNotificationsWithOptions } from '@/lib/order-payment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSellerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
  }

  const { id: orderId } = await ctx.params

  const { data: brandProducts } = await supabaseServer
    .from('products')
    .select('id')
    .eq('brand_id', session.brandId)

  const productIds = new Set((brandProducts ?? []).map((p) => p.id))

  const { data: order, error: orderErr } = await supabaseServer
    .from('orders')
    .select('id, items, payment_status')
    .eq('id', orderId)
    .maybeSingle()

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  const items = (order.items ?? []) as Array<{ product_id?: string }>
  const hasOurProducts = items.some((i) => i.product_id && productIds.has(i.product_id))

  if (!hasOurProducts) {
    return NextResponse.json({ error: 'Este pedido no incluye productos de tu marca' }, { status: 403 })
  }

  if (String(order.payment_status || '').toLowerCase() !== 'completed') {
    return NextResponse.json(
      { error: 'Solo se pueden reenviar correos en pedidos pagados.' },
      { status: 400 }
    )
  }

  const result = await ensureApprovedOrderNotificationsWithOptions(orderId, {
    forceBuyer: true,
    forceSellers: true,
  })

  if (!result.ok) {
    return NextResponse.json({ error: 'No se pudieron reenviar los correos.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, resent: true })
}
