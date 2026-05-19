import { NextRequest, NextResponse } from 'next/server'
import { validateCouponForCheckout } from '@/lib/coupons'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      code?: string
      subtotal?: number
      shippingCost?: number
      buyerEmail?: string
      userId?: string | null
      items?: Array<{ productId?: string }>
    }

    const result = await validateCouponForCheckout({
      code: body.code ?? '',
      subtotal: Number(body.subtotal ?? 0),
      shippingCost: Number(body.shippingCost ?? 0),
      buyerEmail: body.buyerEmail ?? '',
      userId: body.userId ?? null,
      productIds: (body.items ?? []).map((item) => String(item.productId ?? '')).filter(Boolean),
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status ?? 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('coupon validate', error)
    return NextResponse.json({ error: 'No se pudo validar el cupón.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
