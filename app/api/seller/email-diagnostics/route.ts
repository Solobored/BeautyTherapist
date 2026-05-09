import { NextRequest, NextResponse } from 'next/server'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { getResendConfigSnapshot, sendOrderConfirmedToBuyer } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSellerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
  }

  const snap = getResendConfigSnapshot()
  return NextResponse.json({
    ...snap,
    hint: snap.usingDefaultFrom
      ? 'Configura RESEND_FROM_EMAIL con un remitente de tu dominio verificado en Resend; onboarding@resend.dev no entrega a terceros.'
      : null,
  })
}

export async function POST(request: NextRequest) {
  const session = await getSellerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
  }

  const to = session.seller.email?.trim()
  if (!to) {
    return NextResponse.json({ error: 'Tu cuenta no tiene email.' }, { status: 400 })
  }

  const result = await sendOrderConfirmedToBuyer({
    to,
    buyerName: session.seller.ownerName || 'Prueba',
    orderId: 'test-diagnostic',
    items: [{ name: 'Correo de prueba', quantity: 1, price: 0 }],
    total: 0,
  })

  if (!result.sent) {
    return NextResponse.json(
      {
        ok: false,
        error: result.errorMessage ?? 'Resend no aceptó el envío.',
        config: getResendConfigSnapshot(),
      },
      { status: 502 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: `Prueba enviada a ${to}. Revisa bandeja y el panel de Resend (id: ${result.id ?? 'n/d'}).`,
    resendEmailId: result.id,
    config: getResendConfigSnapshot(),
  })
}
