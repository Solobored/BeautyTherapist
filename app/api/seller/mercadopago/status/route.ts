import { NextRequest, NextResponse } from 'next/server'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { getSellerConnectionStatus } from '@/lib/mercadopago-oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSellerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
  }

  const status = await getSellerConnectionStatus(session.brandId)
  return NextResponse.json(status)
}
