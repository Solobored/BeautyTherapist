'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const CONSENT_KEY = 'bt_cookie_consent_v1'

type ConsentValue = 'accepted' | 'rejected'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(CONSENT_KEY) : null
    if (!stored) setVisible(true)
  }, [])

  function setConsent(value: ConsentValue) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, date: new Date().toISOString() }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur px-4 py-4 shadow-lg"
    >
      <div className="container mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground max-w-2xl">
          Usamos cookies esenciales para el funcionamiento de la tienda (sesión, carrito, pagos) y
          cookies de analítica agregada para entender el uso del sitio. Puedes revisar el detalle en
          nuestra{' '}
          <Link href="/politicas/cookies" className="underline hover:text-foreground">
            Política de Cookies
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setConsent('rejected')}>
            Solo esenciales
          </Button>
          <Button size="sm" onClick={() => setConsent('accepted')}>
            Aceptar todas
          </Button>
        </div>
      </div>
    </div>
  )
}
