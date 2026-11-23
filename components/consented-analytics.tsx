'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readStoredCookieConsent,
  type CookieConsentValue,
} from '@/lib/cookie-consent'
import { GA_MEASUREMENT_ID, shouldTrackAnalyticsPath } from '@/lib/analytics'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const DENIED_ANALYTICS_CONSENT = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
}
const GRANTED_ANALYTICS_CONSENT = {
  ...DENIED_ANALYTICS_CONSENT,
  analytics_storage: 'granted',
}

export function ConsentedAnalytics() {
  const pathname = usePathname()
  const [consent, setConsent] = useState<CookieConsentValue | null>(null)
  const [gaReady, setGaReady] = useState(false)
  const isTrackablePath = pathname ? shouldTrackAnalyticsPath(pathname) : false

  useEffect(() => {
    setConsent(readStoredCookieConsent())

    function handleConsentChange(event: Event) {
      const value = (event as CustomEvent<CookieConsentValue>).detail
      if (value !== 'accepted' && value !== 'rejected') return

      window.gtag?.(
        'consent',
        'update',
        value === 'accepted' ? GRANTED_ANALYTICS_CONSENT : DENIED_ANALYTICS_CONSENT,
      )

      setConsent(value)
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange)
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange)
  }, [])

  useEffect(() => {
    if (consent !== 'accepted' || !gaReady || !pathname || !isTrackablePath) return

    window.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_title: document.title,
      page_location: `${window.location.origin}${pathname}`,
    })
  }, [consent, gaReady, isTrackablePath, pathname])

  if (consent !== 'accepted' || !isTrackablePath) return null

  return (
    <>
      <VercelAnalytics
        framework="next"
        route={pathname}
        path={pathname}
        basePath={process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH}
      />
      <Script id="google-analytics-bootstrap" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = function() { window.dataLayer.push(arguments); };
          window.gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
          window.gtag('consent', 'update', { analytics_storage: 'granted' });
          window.gtag('js', new Date());
          window.gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        onReady={() => setGaReady(true)}
      />
    </>
  )
}
