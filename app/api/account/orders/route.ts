import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { normalizeBuyerOrderStatus } from '@/lib/order-visibility'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buyerEmail = searchParams.get('email')?.trim().toLowerCase()
    const userId = searchParams.get('userId')?.trim()

    if (!buyerEmail && !userId) {
      return NextResponse.json({ error: 'Falta email o userId.' }, { status: 400 })
    }

    let query = supabaseServer
      .from('orders')
      .select('id, buyer_name, buyer_phone, buyer_email, shipping_address, items, subtotal, shipping_cost, discount, total, payment_status, order_status, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (buyerEmail) {
      query = query.eq('buyer_email', buyerEmail)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: orders, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const mapped = (orders ?? []).map((order) => ({
      id: order.id,
      date: order.created_at,
      status: normalizeBuyerOrderStatus(order.order_status, order.payment_status) as 'pending' | 'shipped' | 'delivered',
      items: (Array.isArray(order.items) ? order.items : []).map((item: any) => ({
        productId: item.product_id ?? '',
        name: item.product_name ?? 'Producto',
        quantity: Number(item.quantity ?? 1),
        price: Number(item.price ?? 0),
        image: item.product_image ?? '',
      })),
      total: Number(order.total ?? 0),
      shippingAddress: {
        id: order.id,
        label: 'Envío',
        fullName: String(order.buyer_name ?? ''),
        street: order.shipping_address?.street ?? '',
        city: order.shipping_address?.city ?? '',
        state: order.shipping_address?.state ?? '',
        zipCode: order.shipping_address?.zip ?? '',
        country: order.shipping_address?.country ?? '',
        phone: order.buyer_phone ?? '',
        isDefault: true,
      },
    }))

    return NextResponse.json({ orders: mapped })
  } catch (error) {
    console.error('account orders fetch error', error)
    return NextResponse.json({ error: 'No se pudieron cargar tus pedidos.' }, { status: 500 })
  }
}
