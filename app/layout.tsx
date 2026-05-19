import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, Josefin_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/contexts/language-context'
import { CartProvider } from '@/contexts/cart-context'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'
import { getSiteUrl, toAbsoluteUrl } from '@/lib/site-url'
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
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true} className={`${playfair.variable} ${dmSans.variable} ${josefin.variable} font-sans antialiased bg-background text-foreground`}>
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
