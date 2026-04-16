import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { normalizeEmail } from '@/lib/seller-identity'
import {
  getSellerSessionFromRequest,
  hashSellerPassword,
  revokeOtherSellerSessions,
  verifySellerPassword,
} from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function PUT(request: NextRequest) {
  const session = await getSellerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
  }

  let body: { currentPassword?: string; newEmail?: string; newPassword?: string } = {}
  try {
    body = (await request.json()) as { currentPassword?: string; newEmail?: string; newPassword?: string }
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }

  const currentPassword = body.currentPassword?.trim() ?? ''
  const nextEmail = body.newEmail?.trim() ? normalizeEmail(body.newEmail) : ''
  const nextPassword = body.newPassword?.trim() ?? ''

  if (!currentPassword) {
    return NextResponse.json({ error: 'Debes ingresar tu contraseña actual.' }, { status: 400 })
  }
  if (!nextEmail && !nextPassword) {
    return NextResponse.json({ error: 'Ingresa un nuevo correo o una nueva contraseña.' }, { status: 400 })
  }
  if (nextEmail && !EMAIL_PATTERN.test(nextEmail)) {
    return NextResponse.json({ error: 'Ingresa un correo válido.' }, { status: 400 })
  }
  if (nextPassword && nextPassword.length < 8) {
    return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
  }

  const { data: credentials, error: credentialsError } = await supabaseServer
    .from('seller_auth_credentials')
    .select('seller_id, email, password_hash')
    .eq('seller_id', session.sellerId)
    .maybeSingle()

  if (credentialsError || !credentials?.seller_id) {
    return NextResponse.json({ error: 'No se encontró la cuenta del vendedor.' }, { status: 404 })
  }

  if (!verifySellerPassword(currentPassword, credentials.password_hash)) {
    return NextResponse.json({ error: 'La contraseña actual no es correcta.' }, { status: 401 })
  }

  if (!nextPassword && (!nextEmail || nextEmail === normalizeEmail(credentials.email))) {
    return NextResponse.json({ error: 'No hay cambios para guardar.' }, { status: 400 })
  }

  const updatesCredentials: Record<string, string> = {
    updated_at: new Date().toISOString(),
  }
  const updatesProfile: Record<string, string> = {
    updated_at: new Date().toISOString(),
  }

  if (nextEmail && nextEmail !== normalizeEmail(credentials.email)) {
    const { data: duplicateCredential } = await supabaseServer
      .from('seller_auth_credentials')
      .select('seller_id')
      .eq('email', nextEmail)
      .neq('seller_id', session.sellerId)
      .maybeSingle()

    if (duplicateCredential?.seller_id) {
      return NextResponse.json({ error: 'Ese correo ya está en uso por otra cuenta.' }, { status: 409 })
    }

    const { data: duplicateProfile } = await supabaseServer
      .from('profiles')
      .select('id')
      .eq('email', nextEmail)
      .neq('id', session.sellerId)
      .maybeSingle()

    if (duplicateProfile?.id) {
      return NextResponse.json({ error: 'Ese correo ya está en uso por otra cuenta.' }, { status: 409 })
    }

    updatesCredentials.email = nextEmail
    updatesProfile.email = nextEmail
  }

  if (nextPassword) {
    updatesCredentials.password_hash = hashSellerPassword(nextPassword)
    updatesCredentials.password_updated_at = new Date().toISOString()
  }

  if (Object.keys(updatesProfile).length > 1) {
    const { error } = await supabaseServer
      .from('profiles')
      .update(updatesProfile)
      .eq('id', session.sellerId)
      .eq('user_type', 'seller')

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'No se pudo actualizar el perfil del vendedor.' }, { status: 500 })
    }
  }

  if (Object.keys(updatesCredentials).length > 1) {
    const { error } = await supabaseServer
      .from('seller_auth_credentials')
      .update(updatesCredentials)
      .eq('seller_id', session.sellerId)

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'No se pudo actualizar la cuenta del vendedor.' }, { status: 500 })
    }
  }

  if (nextPassword) {
    await revokeOtherSellerSessions(session.sellerId, session.sessionId)
  }

  const { data: refreshedProfile } = await supabaseServer
    .from('profiles')
    .select('email')
    .eq('id', session.sellerId)
    .maybeSingle()

  return NextResponse.json({
    ok: true,
    seller: {
      ...session.seller,
      email: refreshedProfile?.email ? normalizeEmail(refreshedProfile.email) : session.seller.email,
    },
  })
}
