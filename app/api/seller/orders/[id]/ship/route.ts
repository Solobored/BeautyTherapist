import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { resolveBrandIdForSeller } from '@/lib/seller-server'
import { sendOrderShippedToBuyer } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await ctx.params
  const email = request.headers.get('x-seller-email')?.trim() ?? ''
  const slug = request.headers.get('x-brand-slug')?.trim() ?? ''

  if (!email) {
    return NextResponse.json({ error: 'Missing x-seller-email header' }, { status: 400 })
  }

  const brandId = await resolveBrandIdForSeller(supabaseServer, email, slug || undefined)
  if (!brandId) {
    return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
  }

  const { data: brandProducts } = await supabaseServer.from('products').select('id').eq('brand_id', brandId)
  const productIds = new Set((brandProducts ?? []).map((p) => p.id))

  const { data: order, error: oErr } = await supabaseServer.from('orders').select('*').eq('id', orderId).maybeSingle()
  if (oErr || !order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  const items = (order.items ?? []) as { product_id?: string }[]
  const touchesBrand = items.some((i) => i.product_id && productIds.has(i.product_id))
  if (!touchesBrand) {
    return NextResponse.json({ error: 'Este pedido no incluye productos de tu marca' }, { status: 403 })
  }

  if (order.order_status === 'cancelled') {
    return NextResponse.json({ error: 'El pedido está cancelado' }, { status: 400 })
  }
  if (order.order_status === 'shipped' || order.order_status === 'delivered') {
    return NextResponse.json({ error: 'El pedido ya fue marcado como enviado' }, { status: 400 })
  }

  const { error: uErr } = await supabaseServer
    .from('orders')
    .update({
      order_status: 'shipped',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (uErr) {
    console.error(uErr)
    return NextResponse.json({ error: 'No se pudo actualizar el pedido' }, { status: 500 })
  }

  await sendOrderShippedToBuyer({
    to: order.buyer_email,
    buyerName: order.buyer_name,
    orderId: order.id,
  })

  return NextResponse.json({ ok: true })
}
