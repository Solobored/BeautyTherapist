'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_KEY,
  COOKIE_PREFERENCES_REQUESTED_EVENT,
  readStoredCookieConsent,
  type CookieConsentValue,
} from '@/lib/cookie-consent'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!readStoredCookieConsent()) setVisible(true)

    function openPreferences() {
      setVisible(true)
    }

    window.addEventListener(COOKIE_PREFERENCES_REQUESTED_EVENT, openPreferences)
    return () => window.removeEventListener(COOKIE_PREFERENCES_REQUESTED_EVENT, openPreferences)
  }, [])

  function setConsent(value: CookieConsentValue) {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({ value, date: new Date().toISOString() }),
    )
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: value }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      data-cookie-consent-banner
      className="fixed bottom-[calc(4.5rem_+_env(safe-area-inset-bottom))] left-1/2 z-30 w-[min(calc(100%-1rem),56rem)] -translate-x-1/2 rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-xl backdrop-blur md:bottom-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground max-w-2xl">
          Usamos cookies esenciales para el funcionamiento de la tienda. La analítica de Vercel y
          Google Analytics solo se activa si la aceptas. Puedes revisar los detalles en nuestra{' '}
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
