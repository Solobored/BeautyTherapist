import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, Josefin_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/contexts/language-context'
import { CartProvider } from '@/contexts/cart-context'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'
import Script from 'next/script'
import { getSiteUrl, toAbsoluteUrl } from '@/lib/site-url'
import { buildOrganizationSchema, buildWebsiteSchema } from '@/lib/seo'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const josefin = Josefin_Sans({ 
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Beauty & Therapy | Marketplace de belleza premium',
    template: '%s | Beauty & Therapy',
  },
  description:
    'Skincare y maquillaje seleccionados por expertos. Marcas premium en un solo lugar.',
  keywords: ['belleza', 'skincare', 'maquillaje', 'cosmética', 'marketplace', 'Chile'],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      {
        url: '/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: ['/apple-icon.png'],
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: getSiteUrl(),
    siteName: 'Beauty & Therapy',
    title: 'Beauty & Therapy | Marketplace de belleza premium',
    description: 'Skincare y maquillaje seleccionados por expertos. Marcas premium en un solo lugar.',
    images: [
      {
        url: toAbsoluteUrl('/apple-icon.png'),
        alt: 'Beauty & Therapy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beauty & Therapy | Marketplace de belleza premium',
    description: 'Skincare y maquillaje seleccionados por expertos. Marcas premium en un solo lugar.',
    images: [toAbsoluteUrl('/apple-icon.png')],
  },
}

export const viewport: Viewport = {
  themeColor: '#C8B8E8',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationSchema = buildOrganizationSchema()
  const websiteSchema = buildWebsiteSchema()

  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true} className={`${playfair.variable} ${dmSans.variable} ${josefin.variable} font-sans antialiased bg-background text-foreground`}>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
        <Analytics />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
