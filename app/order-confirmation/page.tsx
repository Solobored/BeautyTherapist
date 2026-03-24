'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Package, Mail } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

function OrderConfirmationContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || 'BT-XXXXXX'
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              {t('confirmation.title')}
            </h1>
            
            {/* Message */}
            <p className="text-muted-foreground mb-8">
              {t('confirmation.message')}
            </p>
            
            {/* Order Number */}
            <div className="bg-secondary rounded-2xl p-6 mb-8">
              <p className="text-sm text-muted-foreground mb-1">{t('confirmation.orderNumber')}</p>
              <p className="font-mono text-2xl font-semibold text-foreground">{orderNumber}</p>
            </div>
            
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Email Sent</p>
                  <p className="text-xs text-muted-foreground">Check your inbox</p>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Processing</p>
                  <p className="text-xs text-muted-foreground">Ships within 24h</p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/shop">{t('cart.continueShopping')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">{t('nav.home')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
