import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { buildAuthorizationUrl } from '@/lib/mercadopago-oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSellerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
  }

  const nonce = crypto.randomBytes(16).toString('hex')
  const secret = process.env.MERCADOPAGO_MARKETPLACE_CLIENT_SECRET ?? ''
  const signature = crypto.createHmac('sha256', secret).update(`${session.brandId}:${nonce}`).digest('hex')
  const state = Buffer.from(JSON.stringify({ brandId: session.brandId, nonce, signature })).toString('base64url')

  return NextResponse.redirect(buildAuthorizationUrl(state))
}
