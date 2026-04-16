import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { normalizeEmail } from '@/lib/seller-identity'

export const SELLER_SESSION_COOKIE_NAME = 'bt_seller_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000
const PASSWORD_KEY_PREFIX = 'scrypt'
const PASSWORD_KEY_LENGTH = 64

const LEGACY_SELLER_BOOTSTRAP_ACCOUNTS = [
  {
    id: 'f486c511-c72d-4c32-a562-af8606a448df',
    email: 'angebae@gmail.com',
    password: 'password123',
  },
] as const

export type SellerSessionUser = {
  id: string
  type: 'seller'
  brandName: string
  ownerName: string
  email: string
  phone: string
  country: string
  brandLogo?: string
  brandBanner?: string
  brandDescription?: string
  facebookUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  category: 'skincare' | 'makeup' | 'both'
}

export type SellerSessionContext = {
  sessionId: string
  sessionToken: string
  sellerId: string
  brandId: string
  seller: SellerSessionUser
}

function nowIso() {
  return new Date().toISOString()
}

function expiresAtIso() {
  return new Date(Date.now() + SESSION_TTL_MS).toISOString()
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function hashSellerPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString('hex')
  return `${PASSWORD_KEY_PREFIX}$${salt}$${hash}`
}

export function verifySellerPassword(password: string, storedHash: string) {
  const [algorithm, salt, expectedHash] = storedHash.split('$')
  if (algorithm !== PASSWORD_KEY_PREFIX || !salt || !expectedHash) {
    return false
  }

  const actualHash = crypto.scryptSync(password, salt, PASSWORD_KEY_LENGTH)
  const expectedBuffer = Buffer.from(expectedHash, 'hex')

  if (actualHash.length !== expectedBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(actualHash, expectedBuffer)
}

export function setSellerSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SELLER_SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export function clearSellerSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SELLER_SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  })
}

export async function ensureLegacySellerCredential(email: string) {
  const normalizedEmail = normalizeEmail(email)
  const legacyAccount = LEGACY_SELLER_BOOTSTRAP_ACCOUNTS.find(
    (account) => normalizeEmail(account.email) === normalizedEmail
  )

  if (!legacyAccount) {
    return
  }

  const { data: existingCredential } = await supabaseServer
    .from('seller_auth_credentials')
    .select('seller_id')
    .eq('seller_id', legacyAccount.id)
    .maybeSingle()

  if (existingCredential?.seller_id) {
    return
  }

  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('id, email, user_type')
    .eq('id', legacyAccount.id)
    .eq('user_type', 'seller')
    .maybeSingle()

  if (!profile?.id) {
    return
  }

  await supabaseServer.from('seller_auth_credentials').upsert(
    {
      seller_id: profile.id,
      email: normalizedEmail,
      password_hash: hashSellerPassword(legacyAccount.password),
      created_at: nowIso(),
      updated_at: nowIso(),
      password_updated_at: nowIso(),
    },
    { onConflict: 'seller_id' }
  )
}

export async function fetchSellerUserById(
  sellerId: string
): Promise<{ seller: SellerSessionUser; brandId: string } | null> {
  const { data: profile, error: profileError } = await supabaseServer
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('id', sellerId)
    .eq('user_type', 'seller')
    .maybeSingle()

  if (profileError || !profile?.id) {
    return null
  }

  const { data: brand, error: brandError } = await supabaseServer
    .from('brands')
    .select(
      'id, brand_name, description, logo_url, banner_url, facebook_url, instagram_url, tiktok_url, category'
    )
    .eq('owner_id', sellerId)
    .maybeSingle()

  if (brandError || !brand?.id) {
    return null
  }

  return {
    brandId: brand.id,
    seller: {
      id: profile.id,
      type: 'seller',
      ownerName: profile.full_name,
      email: normalizeEmail(profile.email),
      phone: profile.phone ?? '',
      country: '',
      brandName: brand.brand_name,
      brandLogo: brand.logo_url ?? undefined,
      brandBanner: brand.banner_url ?? undefined,
      brandDescription: brand.description ?? undefined,
      facebookUrl: brand.facebook_url ?? undefined,
      instagramUrl: brand.instagram_url ?? undefined,
      tiktokUrl: brand.tiktok_url ?? undefined,
      category: ((brand.category as SellerSessionUser['category'] | null) ?? 'both'),
    },
  }
}

export async function createSellerSession(sellerId: string) {
  const sessionToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(sessionToken)
  const expiresAt = expiresAtIso()

  const { data: sessionRow, error } = await supabaseServer
    .from('seller_auth_sessions')
    .insert({
      seller_id: sellerId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_at: nowIso(),
      updated_at: nowIso(),
      last_seen_at: nowIso(),
    })
    .select('id')
    .single()

  if (error || !sessionRow?.id) {
    throw new Error(error?.message || 'No se pudo crear la sesión del vendedor')
  }

  return { sessionId: sessionRow.id, sessionToken }
}

export async function getSellerSessionFromRequest(
  request: Pick<NextRequest, 'cookies'>
): Promise<SellerSessionContext | null> {
  const sessionToken = request.cookies.get(SELLER_SESSION_COOKIE_NAME)?.value?.trim()
  if (!sessionToken) {
    return null
  }

  const { data: sessionRow, error } = await supabaseServer
    .from('seller_auth_sessions')
    .select('id, seller_id, expires_at, revoked_at')
    .eq('token_hash', hashToken(sessionToken))
    .maybeSingle()

  if (error || !sessionRow?.id) {
    return null
  }

  if (sessionRow.revoked_at || new Date(sessionRow.expires_at).getTime() <= Date.now()) {
    return null
  }

  const sellerData = await fetchSellerUserById(sessionRow.seller_id)
  if (!sellerData) {
    return null
  }

  return {
    sessionId: sessionRow.id,
    sessionToken,
    sellerId: sessionRow.seller_id,
    brandId: sellerData.brandId,
    seller: sellerData.seller,
  }
}

export async function revokeSellerSession(sessionToken: string) {
  await supabaseServer
    .from('seller_auth_sessions')
    .update({
      revoked_at: nowIso(),
      updated_at: nowIso(),
    })
    .eq('token_hash', hashToken(sessionToken))
    .is('revoked_at', null)
}

export async function revokeOtherSellerSessions(sellerId: string, keepSessionId: string) {
  await supabaseServer
    .from('seller_auth_sessions')
    .update({
      revoked_at: nowIso(),
      updated_at: nowIso(),
    })
    .eq('seller_id', sellerId)
    .neq('id', keepSessionId)
    .is('revoked_at', null)
}
