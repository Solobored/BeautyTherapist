const LOCAL_FALLBACK_URL = 'http://localhost:3000'

function normalizeBaseUrl(value: string | undefined | null): string | null {
  const raw = value?.trim()
  if (!raw) return null

  const withProtocol =
    raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`

  try {
    return new URL(withProtocol).toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

export function getSiteUrl() {
  return (
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeBaseUrl(process.env.APP_URL) ??
    normalizeBaseUrl(process.env.VERCEL_URL) ??
    LOCAL_FALLBACK_URL
  )
}

export function toAbsoluteUrl(pathname: string) {
  return new URL(pathname, `${getSiteUrl()}/`).toString()
}
