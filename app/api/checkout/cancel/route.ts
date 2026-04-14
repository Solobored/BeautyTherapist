import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { orderId, status } = (await request.json().catch(() => ({}))) as {
      orderId?: string
      status?: string
    }

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId es obligatorio' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('orders')
      .update({
        payment_status: 'cancelled',
        order_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .in('payment_status', ['pending', 'failed'])
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('checkout/cancel', error)
      return NextResponse.json({ error: 'No se pudo cancelar el pedido' }, { status: 500 })
    }

    return NextResponse.json({
      cancelled: Boolean(data?.id),
      reason: status ?? 'user_returned',
    })
  } catch (e) {
    console.error('checkout/cancel', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
