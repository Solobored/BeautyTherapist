import { NextRequest, NextResponse } from 'next/server'
import { isChileCountry } from '@/lib/shipping'
import { getChileShippingQuoteDetails } from '@/lib/shipping-checkout-server'
import type { ChileDeliveryChannel } from '@/lib/chile-shipping'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const country = String(body.country ?? 'Chile').trim()
    const regionCode = String(body.chileRegionCode ?? '').trim()
    const channel = body.chileDeliveryChannel === 'punto' ? 'punto' : ('domicilio' as ChileDeliveryChannel)
    const items = (body.items ?? []) as { productId?: string; quantity?: number }[]

    if (!isChileCountry(country)) {
      return NextResponse.json(
        { error: 'Cotización por peso/región solo aplica a Chile.' },
        { status: 400 }
      )
    }

    if (!regionCode) {
      return NextResponse.json({ error: 'Indica la región de destino.' }, { status: 400 })
    }

    const cartItems = items
      .filter((i) => i.productId && i.quantity && i.quantity > 0)
      .map((i) => ({ productId: String(i.productId), quantity: Math.floor(Number(i.quantity)) }))

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Sin productos para cotizar.' }, { status: 400 })
    }

    const { quote, totalGrams } = await getChileShippingQuoteDetails({
      chileRegionCode: regionCode,
      chileDeliveryChannel: channel,
      cartItems,
    })

    if (!quote) {
      return NextResponse.json({ error: 'Región no válida.' }, { status: 400 })
    }

    return NextResponse.json({
      shippingClp: quote.clp,
      totalGrams,
      parcel: quote.parcel,
      regionLabel: quote.region.label,
      zone: quote.region.zone,
      eta: quote.region.eta,
      channel,
    })
  } catch (e) {
    console.error('shipping-quote', e)
    return NextResponse.json({ error: 'Error al cotizar envío' }, { status: 500 })
  }
}
