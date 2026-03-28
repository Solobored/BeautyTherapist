/**
 * Rate limit simple en memoria (una instancia de Node). En serverless puede resetearse entre invocaciones;
 * sigue siendo útil contra abuso casual. Para límites estrictos usar Redis/Upstash.
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }
  if (b.count >= max) {
    return { ok: false, retryAfterMs: Math.max(0, b.resetAt - now) }
  }
  b.count += 1
  return { ok: true }
}

export function clientIp(request: { headers: Headers }): string {
  const xf = request.headers.get('x-forwarded-for')
  if (xf) {
    const first = xf.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}
