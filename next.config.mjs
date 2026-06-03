/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'
const supabaseHostname = (() => {
  try {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    return raw ? new URL(raw).hostname : null
  } catch {
    return null
  }
})()

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.supabase.co https://*.tile.openstreetmap.org https://cdnjs.cloudflare.com",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co https://api.cloudinary.com https://api.mercadopago.com https://nominatim.openstreetmap.org https://vitals.vercel-insights.com${isDev ? ' ws: http://localhost:*' : ''}`,
  "frame-src 'self' https://www.mercadopago.com https://*.mercadopago.com",
  "media-src 'self' blob: https://res.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.mercadopago.com https://*.mercadopago.com",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/productos',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/tienda',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/products',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/product/:path*',
        destination: '/shop/:path*',
        permanent: true,
      },
      {
        source: '/belleza',
        destination: '/productos-profesionales-belleza',
        permanent: true,
      },
      {
        source: '/productos-de-belleza',
        destination: '/productos-profesionales-belleza',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      ...(supabaseHostname ? [{ protocol: 'https', hostname: supabaseHostname }] : []),
    ],
  },
  turbopack: {},
}

export default nextConfig
