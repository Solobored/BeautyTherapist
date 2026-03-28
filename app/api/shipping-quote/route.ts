import { NextRequest, NextResponse } from 'next/server'
import {
  distanceQuoteEnabled,
  isChileCountry,
  nationalFlatClp,
  quoteNationalDistanceClp,
} from '@/lib/shipping'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const city = String(body.city ?? '').trim()
    const state = String(body.state ?? '').trim()
    const country = String(body.country ?? '').trim()

    if (!distanceQuoteEnabled()) {
      return NextResponse.json({
        enabled: false,
        shippingClp: nationalFlatClp(),
        message: 'Distance quote disabled on server',
      })
    }

    if (!isChileCountry(country)) {
      return NextResponse.json(
        { error: 'La estimación por distancia solo aplica a envíos dentro de Chile.' },
        { status: 400 }
      )
    }

    if (!city || !state) {
      return NextResponse.json({ error: 'Indica ciudad y región para calcular.' }, { status: 400 })
    }

    const quote = await quoteNationalDistanceClp(city, state, country)
    if (!quote) {
      return NextResponse.json({
        shippingClp: nationalFlatClp(),
        fallback: true,
        message: 'No se pudo geolocalizar; se usa tarifa nacional plana.',
      })
    }

    return NextResponse.json({
      enabled: true,
      shippingClp: quote.shippingClp,
      distanceKm: quote.distanceKm,
    })
  } catch (e) {
    console.error('shipping-quote', e)
    return NextResponse.json({ error: 'Error al calcular envío' }, { status: 500 })
  }
}
