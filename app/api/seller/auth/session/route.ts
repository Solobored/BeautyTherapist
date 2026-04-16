import { NextRequest, NextResponse } from 'next/server'
import { clearSellerSessionCookie, getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSellerSessionFromRequest(request)

  if (!session) {
    const response = NextResponse.json({ seller: null }, { status: 401 })
    clearSellerSessionCookie(response)
    return response
  }

  return NextResponse.json({ seller: session.seller })
}
