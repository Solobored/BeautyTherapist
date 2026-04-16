import { NextRequest, NextResponse } from 'next/server'
import {
  clearSellerSessionCookie,
  revokeSellerSession,
  SELLER_SESSION_COOKIE_NAME,
} from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(SELLER_SESSION_COOKIE_NAME)?.value?.trim()

  if (sessionToken) {
    await revokeSellerSession(sessionToken)
  }

  const response = NextResponse.json({ ok: true })
  clearSellerSessionCookie(response)
  return response
}
