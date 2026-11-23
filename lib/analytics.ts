export const GA_MEASUREMENT_ID = 'G-EZC92D8W26'

const EXCLUDED_PATH_PREFIXES = [
  '/account',
  '/admin',
  '/api',
  '/auth',
  '/checkout',
  '/order-confirmation',
  '/seller',
]

export function shouldTrackAnalyticsPath(pathname: string) {
  return !EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}
