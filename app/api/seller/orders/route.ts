import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { computeSellerOrderAnalytics, type OrderRowForAnalytics } from '@/lib/seller-order-analytics'
import { shouldShowOrderInSellerDashboard } from '@/lib/order-visibility'

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

    // cost_price es opcional (migración 20261029000000). Si la columna aún no existe, reintenta sin ella.
    let { data: brandProducts, error: pErr } = await supabaseServer
      .from('products')
      .select('id, category, cost_price')
      .eq('brand_id', session.brandId)

    if (pErr) {
      const retry = await supabaseServer.from('products').select('id, category').eq('brand_id', session.brandId)
      brandProducts = retry.data as typeof brandProducts
      pErr = retry.error
    }

    if (pErr) {
      console.error(pErr)
      return NextResponse.json({ error: pErr.message }, { status: 500 })
    }

    const productIds = new Set((brandProducts ?? []).map((p) => p.id))
    const productCosts: Record<string, number | null> = {}
    for (const p of (brandProducts ?? []) as { id: string; cost_price?: number | string | null }[]) {
      productCosts[p.id] = p.cost_price != null ? Number(p.cost_price) : null
    }
    const productsById = new Map(
      (brandProducts ?? []).map((p) => [p.id, { category: String(p.category ?? 'other') }])
    )

    if (productIds.size === 0) {
      return NextResponse.json({
        orders: [],
        productCosts,
        analytics: {
          totalRevenue: 0,
          totalSales: 0,
          revenueThisMonth: 0,
          salesThisMonth: 0,
          totalRevenueLastMonth: 0,
          totalSalesLastMonth: 0,
          revenueByMonth: [],
          salesByCategory: [],
        },
      })
    }

    const ORDER_COLUMNS =
      'id, buyer_name, buyer_email, buyer_phone, shipping_address, items, subtotal, shipping_cost, discount, total, order_status, payment_status, created_at'
    // mercadopago_marketplace_fee permite mostrar la comisión real en Finanzas; si la migración no está aplicada, se omite.
    let { data: orders, error: oErr } = await supabaseServer
      .from('orders')
      .select(`${ORDER_COLUMNS}, mercadopago_marketplace_fee`)
      .order('created_at', { ascending: false })
      .limit(1000)

    if (oErr) {
      const retry = await supabaseServer
        .from('orders')
        .select(ORDER_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(1000)
      orders = retry.data as typeof orders
      oErr = retry.error
    }

    if (oErr) {
      console.error(oErr)
      return NextResponse.json({ error: oErr.message }, { status: 500 })
    }

    const visibleOrders = (orders ?? []).filter((order) =>
      shouldShowOrderInSellerDashboard({
        order_status: order.order_status,
        payment_status: order.payment_status,
      })
    )

    const filtered = visibleOrders.filter((order) => {
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
        marketplaceFee:
          (order as { mercadopago_marketplace_fee?: number | null }).mercadopago_marketplace_fee ?? null,
      }
    })

    return NextResponse.json({ orders: rows, analytics, productCosts })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
