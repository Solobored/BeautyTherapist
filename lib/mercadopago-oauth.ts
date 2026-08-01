import { supabaseServer } from '@/lib/supabase'
import { decryptToken, encryptToken } from '@/lib/mp-token-crypto'

const MP_API_BASE = 'https://api.mercadopago.com'

const clientId = process.env.MERCADOPAGO_MARKETPLACE_CLIENT_ID ?? ''
const clientSecret = process.env.MERCADOPAGO_MARKETPLACE_CLIENT_SECRET ?? ''
const redirectUri = process.env.MERCADOPAGO_MARKETPLACE_REDIRECT_URI ?? ''

type OAuthTokenResponse = {
  access_token: string
  public_key: string
  refresh_token: string
  live_mode: boolean
  user_id: number | string
  token_type: string
  expires_in: number
  scope: string
}

export function buildAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    platform_id: 'mp',
    redirect_uri: redirectUri,
    state,
  })
  return `https://auth.mercadopago.com/authorization?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
  const res = await fetch(`${MP_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Mercado Pago OAuth token error: ${res.status} ${text}`)
  }

  return res.json()
}

async function refreshSellerToken(refreshToken: string): Promise<OAuthTokenResponse> {
  const res = await fetch(`${MP_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Mercado Pago OAuth refresh error: ${res.status} ${text}`)
  }

  return res.json()
}

export async function saveSellerAccount(brandId: string, token: OAuthTokenResponse) {
  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString()
  await supabaseServer.from('mercadopago_seller_accounts').upsert({
    brand_id: brandId,
    mp_user_id: String(token.user_id),
    access_token_encrypted: encryptToken(token.access_token),
    refresh_token_encrypted: encryptToken(token.refresh_token),
    public_key: token.public_key,
    live_mode: token.live_mode,
    scope: token.scope,
    token_type: token.token_type,
    expires_at: expiresAt,
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    disconnected_at: null,
  })
}

export async function getValidSellerAccessToken(brandId: string): Promise<string | null> {
  const { data: row } = await supabaseServer
    .from('mercadopago_seller_accounts')
    .select(
      'brand_id, mp_user_id, access_token_encrypted, refresh_token_encrypted, public_key, live_mode, scope, token_type, expires_at, connected_at, updated_at, disconnected_at'
    )
    .eq('brand_id', brandId)
    .is('disconnected_at', null)
    .maybeSingle()

  if (!row) return null

  const expiresAt = new Date(row.expires_at).getTime()
  const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000
  const needsRefresh = expiresAt - Date.now() < fifteenDaysMs

  if (!needsRefresh) {
    return decryptToken(row.access_token_encrypted)
  }

  try {
    const refreshed = await refreshSellerToken(decryptToken(row.refresh_token_encrypted))
    await saveSellerAccount(brandId, refreshed)
    return refreshed.access_token
  } catch (err) {
    console.error(`mercadopago refresh failed for brand ${brandId}`, err)
    return decryptToken(row.access_token_encrypted)
  }
}

export async function getSellerConnectionStatus(brandId: string) {
  const { data } = await supabaseServer
    .from('mercadopago_seller_accounts')
    .select('mp_user_id, live_mode, connected_at, expires_at, disconnected_at')
    .eq('brand_id', brandId)
    .maybeSingle()

  const connected = Boolean(data && !data.disconnected_at)
  return {
    connected,
    mpUserId: connected ? data?.mp_user_id ?? null : null,
    liveMode: connected ? data?.live_mode ?? null : null,
    connectedAt: connected ? data?.connected_at ?? null : null,
    expiresAt: connected ? data?.expires_at ?? null : null,
  }
}

export async function disconnectSellerAccount(brandId: string) {
  await supabaseServer
    .from('mercadopago_seller_accounts')
    .update({ disconnected_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('brand_id', brandId)
}
