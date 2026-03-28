/**
 * URLs used in Checkout Pro (back_urls, notification_url).
 * Mercado Pago rejects auto_return unless back_urls.success is a valid absolute URL
 * (typically https in production; localhost http is often OK in test).
 */
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
 * When false, omit auto_return — avoids MP error invalid_auto_return if success URL is not https.
 */
export function mercadoPagoAllowsAutoReturn(successUrl: string): boolean {
  try {
    const u = new URL(successUrl)
    if (u.protocol === 'https:') return true
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return true
    return false
  } catch {
    return false
  }
}
