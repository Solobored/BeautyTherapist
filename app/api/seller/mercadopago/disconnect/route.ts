import { NextRequest, NextResponse } from 'next/server'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { disconnectSellerAccount } from '@/lib/mercadopago-oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getSellerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
  }

  await disconnectSellerAccount(session.brandId)
  return NextResponse.json({ ok: true })
}
