import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Generate a short, URL-safe token (16 characters, ~96 bits of entropy)
function generateToken(): string {
  return crypto.randomBytes(12).toString('base64url')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      fullName?: string
      email?: string
      phone?: string
      address?: string
      city?: string
      state?: string
      zip?: string
      country?: string
      shippingKind?: 'national' | 'international'
      chileRegionCode?: string
      chileDeliveryChannel?: 'domicilio' | 'punto'
      mapPin?: { lat: number; lng: number } | null
      couponCode?: string | null
      items?: Array<{ id: string; name: string; nameEs?: string; brand?: string; price: number; image: string; quantity: number }>
    }

    // Validate basic payload
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito no puede estar vacío' },
        { status: 400 }
      )
    }

    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

    const { error } = await supabaseServer
      .from('shared_checkout_sessions')
      .insert({
        token,
        session_data: body,
        expires_at: expiresAt,
      })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'No se pudo guardar la sesión' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        token,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}checkout?session=${token}`,
      },
      { status: 201 }
    )
  } catch (e) {
    console.error('Error creating shared checkout session:', e)
    return NextResponse.json(
      { error: 'Error al crear la sesión compartida' },
      { status: 500 }
    )
  }
}
