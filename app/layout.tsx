import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, Josefin_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/contexts/language-context'
import { CartProvider } from '@/contexts/cart-context'
import { AuthProvider } from '@/contexts/auth-context'
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
  title: 'Beauty Therapist | Premium Beauty Marketplace',
  description: 'Where beauty meets expertise. Discover premium skincare and makeup from curated brands like AngeBae.',
  keywords: ['beauty', 'skincare', 'makeup', 'cosmetics', 'marketplace', 'AngeBae'],
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
      </body>
    </html>
  )
}
