import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Beauty & Therapy',
    short_name: 'BeautyTherapist',
    description: 'Marketplace de belleza premium con skincare, maquillaje y marcas expertas.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f4ee',
    theme_color: '#C8B8E8',
    icons: [
      {
        src: '/favicon-48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
