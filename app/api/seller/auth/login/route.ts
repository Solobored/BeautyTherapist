import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { normalizeEmail } from '@/lib/seller-identity'
import {
  createSellerSession,
  ensureLegacySellerCredential,
  fetchSellerUserById,
  setSellerSessionCookie,
  verifySellerPassword,
} from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string } = {}
  try {
    body = (await request.json()) as { email?: string; password?: string }
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }

  const email = body.email?.trim() ? normalizeEmail(body.email) : ''
  const password = body.password?.trim() ?? ''

  if (!email || !EMAIL_PATTERN.test(email) || !password) {
    return NextResponse.json({ error: 'Correo o contraseña inválidos.' }, { status: 400 })
  }

  await ensureLegacySellerCredential(email)

  const { data: credentials, error } = await supabaseServer
    .from('seller_auth_credentials')
    .select('seller_id, email, password_hash')
    .eq('email', email)
    .maybeSingle()

  if (error || !credentials?.seller_id) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 })
  }

  if (!verifySellerPassword(password, credentials.password_hash)) {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 })
  }

  const sellerData = await fetchSellerUserById(credentials.seller_id)
  if (!sellerData) {
    return NextResponse.json({ error: 'No se pudo iniciar la sesión del vendedor.' }, { status: 500 })
  }

  const { sessionToken } = await createSellerSession(credentials.seller_id)
  const response = NextResponse.json({ ok: true, seller: sellerData.seller })
  setSellerSessionCookie(response, sessionToken)
  return response
}
