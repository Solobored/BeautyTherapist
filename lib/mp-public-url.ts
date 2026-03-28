/**
 * URLs used in Checkout Pro (back_urls, notification_url).
 * Mercado Pago rejects auto_return unless back_urls.success is a valid absolute URL.
 * Con credenciales de producción (APP_USR-…), auto_return exige HTTPS en dominio público;
 * localhost o http suele devolver invalid_auto_return / back_url.success must be defined.
 */
export type MercadoPagoRuntimeMode = 'live' | 'sandbox'

/** Sandbox si MERCADOPAGO_USE_SANDBOX=true o el access token empieza por TEST-. */
export function resolveMercadoPagoRuntimeMode(): MercadoPagoRuntimeMode {
  const useSandbox = process.env.MERCADOPAGO_USE_SANDBOX === 'true'
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() ?? ''
  const isTestToken = /^TEST-/i.test(token)
  return useSandbox || isTestToken ? 'sandbox' : 'live'
}

export function getMercadoPagoPublicBaseUrl(): string {
  let raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    ''

  if (!raw && process.env.VERCEL_URL?.trim()) {
    const v = process.env.VERCEL_URL.trim().replace(/^\/+/, '')
    raw = v.startsWith('http://') || v.startsWith('https://') ? v : `https://${v}`
  }

  if (!raw) {
    raw = 'http://localhost:3000'
  }

  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw.replace(/^\/+/, '')}`
  }

  try {
    const u = new URL(raw)
    const base = `${u.protocol}//${u.host}`.replace(/\/+$/, '')
    if (!base || base === 'https://' || base === 'http://') {
      return 'http://localhost:3000'
    }
    return base
  } catch {
    return 'http://localhost:3000'
  }
}

export function buildMercadoPagoCheckoutUrls(orderId: string) {
  const base = getMercadoPagoPublicBaseUrl()
  const q = encodeURIComponent(orderId)
  return {
    success: `${base}/order-confirmation?order=${q}`,
    failure: `${base}/checkout?status=failure&order=${q}`,
    pending: `${base}/checkout?status=pending&order=${q}`,
    notification: `${base}/api/webhooks/mercadopago`,
  }
}

/**
 * Si es false, no se envía auto_return (el comprador vuelve con el botón de MP; igual redirige a back_urls).
 * Live: solo HTTPS + host público (no localhost).
 * Sandbox: permite http(s) en localhost.
 */
export function mercadoPagoAllowsAutoReturn(successUrl: string, mode: MercadoPagoRuntimeMode): boolean {
  try {
    const u = new URL(successUrl.trim())
    const host = u.hostname.toLowerCase()
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')

    if (mode === 'live') {
      if (u.protocol !== 'https:') return false
      if (isLocal) return false
      return true
    }

    if (isLocal) return u.protocol === 'http:' || u.protocol === 'https:'
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

/** Comprueba que las tres URLs existan y sean absolutas (evita payloads inválidos). */
export function assertMercadoPagoBackUrls(urls: { success: string; failure: string; pending: string }): void {
  for (const key of ['success', 'failure', 'pending'] as const) {
    const v = urls[key]?.trim()
    if (!v) {
      throw new Error(
        `Mercado Pago: back_urls.${key} está vacío. Configura NEXT_PUBLIC_APP_URL (https en producción).`
      )
    }
    try {
      new URL(v)
    } catch {
      throw new Error(`Mercado Pago: back_urls.${key} no es una URL válida.`)
    }
  }
}
