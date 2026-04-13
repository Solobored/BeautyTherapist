import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { resolveBrandIdForSeller } from '@/lib/seller-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
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

    // Verificar que el pedido tiene productos de esta marca
    const { data: brandProducts } = await supabaseServer
      .from('products')
      .select('id')
      .eq('brand_id', brandId)

    const productIds = new Set((brandProducts ?? []).map((p) => p.id))

    const { data: order, error: orderErr } = await supabaseServer
      .from('orders')
      .select('items')
      .eq('id', orderId)
      .maybeSingle()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const items = (order.items ?? []) as any[]
    const hasOurProducts = items.some((i) => i.product_id && productIds.has(i.product_id))

    if (!hasOurProducts) {
      return NextResponse.json(
        { error: 'No tienes permiso para borrar este pedido' },
        { status: 403 }
      )
    }

    // Borrar el pedido
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
