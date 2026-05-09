'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Package, Mail } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { useCart } from '@/contexts/cart-context'

function OrderConfirmationContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const orderNumber = searchParams.get('order') || 'BT-XXXXXX'
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || ''
  const [statusText, setStatusText] = useState('Confirmando tu pago...')
  const [mailText, setMailText] = useState('Estamos enviando el comprobante y el código de seguimiento a tu correo.')
  const [shipText, setShipText] = useState('El vendedor verá este pedido en su panel apenas quede confirmado.')

  useEffect(() => {
    let cancelled = false

    const confirm = async () => {
      try {
        for (let attempt = 0; attempt < 4; attempt += 1) {
          const res = await fetch('/api/checkout/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderNumber,
              paymentId: paymentId || undefined,
            }),
          })
          const data = await res.json().catch(() => ({}))

          if (cancelled) return

          if (!res.ok) {
            setStatusText(data.error || 'No pudimos confirmar el pago todavía.')
            setMailText('Te avisaremos por correo cuando el pago quede confirmado.')
            setShipText('Si el cargo ya fue realizado, espera unos minutos y vuelve a revisar tu pedido.')
            return
          }

          const status = String(data.status || '').toLowerCase()
          if (status === 'approved') {
            clearCart()
            setStatusText(t('confirmation.message'))
            setMailText('Te enviamos por correo el detalle de compra y el código del pedido.')
            setShipText('El vendedor ya puede ver este pedido y prepararlo para envío.')
            return
          }

          if (status !== 'pending' && status !== 'in_process') {
            setStatusText('No pudimos confirmar el pago de este pedido.')
            setMailText('Si el cobro se realizó, escríbenos indicando tu código de pedido.')
            setShipText('Puedes volver al inicio o revisar nuevamente en unos minutos.')
            return
          }

          if (attempt < 3) {
            await new Promise((resolve) => window.setTimeout(resolve, 2500))
          }
        }

        setStatusText('Tu pago está en revisión. Te notificaremos apenas quede aprobado.')
        setMailText('Aún no enviamos el correo final porque el pago sigue pendiente.')
        setShipText('El pedido aparecerá al vendedor cuando Mercado Pago confirme la compra.')
      } catch {
        if (!cancelled) {
          setStatusText('No pudimos validar el pago en este momento.')
          setMailText('Si ya pagaste, el correo puede tardar unos minutos en llegar.')
          setShipText('Guarda tu código de pedido para seguimiento.')
        }
      }
    }

    if (orderNumber && orderNumber !== 'BT-XXXXXX') {
      void confirm()
    }

    return () => {
      cancelled = true
    }
  }, [orderNumber, paymentId, clearCart, t])
  
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
              {statusText}
            </p>
            
            {/* Order Number */}
            <div className="bg-secondary rounded-2xl p-6 mb-8">
              <p className="text-sm text-muted-foreground mb-1">{t('confirmation.orderNumber')}</p>
              <p className="font-mono text-2xl font-semibold text-foreground">{orderNumber}</p>
              <p className="text-xs text-muted-foreground mt-2">{t('confirmation.keepNumber')}</p>
            </div>
            
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Correo de compra</p>
                  <p className="text-xs text-muted-foreground">{mailText}</p>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Estado del pedido</p>
                  <p className="text-xs text-muted-foreground">{shipText}</p>
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
        <div className="animate-pulse">Cargando...</div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
