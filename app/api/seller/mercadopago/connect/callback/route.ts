import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { exchangeCodeForToken, saveSellerAccount } from '@/lib/mercadopago-oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const errorParam = request.nextUrl.searchParams.get('error')

  const redirectDashboard = (status: 'ok' | 'error', message?: string) => {
    const url = new URL('/seller/dashboard', request.url)
    url.searchParams.set('mp_connect', status)
    if (message) url.searchParams.set('mp_connect_msg', message)
    url.hash = 'mi-marca'
    return NextResponse.redirect(url)
  }

  if (errorParam) return redirectDashboard('error', 'authorization_denied')
  if (!code || !state) return redirectDashboard('error', 'missing_code_or_state')

  let brandId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as {
      brandId: string
      nonce: string
      signature: string
    }
    const secret = process.env.MERCADOPAGO_MARKETPLACE_CLIENT_SECRET ?? ''
    const expected = crypto.createHmac('sha256', secret).update(`${decoded.brandId}:${decoded.nonce}`).digest('hex')
    if (expected !== decoded.signature) throw new Error('bad signature')
    brandId = decoded.brandId
  } catch {
    return redirectDashboard('error', 'invalid_state')
  }

  try {
    const token = await exchangeCodeForToken(code)
    await saveSellerAccount(brandId, token)
    return redirectDashboard('ok')
  } catch (err) {
    console.error('mercadopago oauth callback error', err)
    return redirectDashboard('error', 'token_exchange_failed')
  }
}
