import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
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
      .select('items')
      .eq('id', orderId)
      .maybeSingle()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const items = (order.items ?? []) as Array<{ product_id?: string }>
    const hasOurProducts = items.some((i) => i.product_id && productIds.has(i.product_id))

    if (!hasOurProducts) {
      return NextResponse.json(
        { error: 'No tienes permiso para borrar este pedido' },
        { status: 403 }
      )
    }

    const { error: deleteErr } = await supabaseServer.from('orders').delete().eq('id', orderId)

    if (deleteErr) {
      console.error(deleteErr)
      return NextResponse.json({ error: 'Error al borrar el pedido' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, deleted: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
