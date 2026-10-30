import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, Josefin_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/contexts/language-context'
import { CartProvider } from '@/contexts/cart-context'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'
import { MaienFloatingAssistant } from '@/components/skin-analysis/maien-floating-assistant'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { getSiteUrl, toAbsoluteUrl } from '@/lib/site-url'
import { buildOrganizationSchema, buildWebsiteSchema, jsonLd } from '@/lib/seo'
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
  applicationName: 'Beauty & Therapy',
  category: 'beauty',
  formatDetection: { telephone: false, email: false, address: false },
  // Pega aquí el código de Google Search Console / Bing (variables de entorno, sin tocar código).
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon-48.png',
        sizes: '48x48',
        type: 'image/png',
      },
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
    shortcut: ['/favicon.ico'],
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema) }} />
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <MaienFloatingAssistant />
              <MobileBottomNav />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
        <Analytics />
        <Toaster richColors position="top-center" />
        <CookieConsentBanner />
      </body>
    </html>
  )
}
