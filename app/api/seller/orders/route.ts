import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { computeSellerOrderAnalytics, type OrderRowForAnalytics } from '@/lib/seller-order-analytics'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type OrderItem = {
  product_id?: string
  product_name?: string
  name?: string
  quantity?: number
  price?: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
    }

    const { data: brandProducts, error: pErr } = await supabaseServer
      .from('products')
      .select('id, category')
      .eq('brand_id', session.brandId)

    if (pErr) {
      console.error(pErr)
      return NextResponse.json({ error: pErr.message }, { status: 500 })
    }

    const productIds = new Set((brandProducts ?? []).map((p) => p.id))
    const productsById = new Map(
      (brandProducts ?? []).map((p) => [p.id, { category: String(p.category ?? 'other') }])
    )

    const { data: orders, error: oErr } = await supabaseServer
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (oErr) {
      console.error(oErr)
      return NextResponse.json({ error: oErr.message }, { status: 500 })
    }

    const paidOrders = (orders ?? []).filter(
      (order) => String(order.payment_status || '').toLowerCase() === 'completed'
    )

    const filtered = paidOrders.filter((order) => {
      const items = (order.items ?? []) as OrderItem[]
      return items.some((i) => i.product_id && productIds.has(i.product_id))
    })

    const analytics = computeSellerOrderAnalytics(
      filtered as OrderRowForAnalytics[],
      productIds,
      productsById
    )

    const rows = filtered.map((order) => {
      const items = (order.items ?? []) as OrderItem[]
      const relevant = items.filter((i) => i.product_id && productIds.has(i.product_id))
      const addr = order.shipping_address as Record<string, string> | null
      return {
        id: order.id,
        buyerName: order.buyer_name,
        buyerEmail: order.buyer_email,
        buyerPhone: order.buyer_phone,
        shippingAddress: addr,
        items: relevant.map((i) => ({
          productId: i.product_id,
          name: i.product_name ?? i.name ?? 'Producto',
          quantity: i.quantity ?? 1,
          price: Number(i.price ?? 0),
        })),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shipping_cost ?? 0),
        discount: Number(order.discount ?? 0),
        total: Number(order.total),
        orderStatus: order.order_status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
      }
    })

    return NextResponse.json({ orders: rows, analytics })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
