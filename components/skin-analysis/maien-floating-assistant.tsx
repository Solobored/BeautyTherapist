'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { MaienCard } from '@/components/skin-analysis/maien-card'

export function MaienFloatingAssistant() {
  const { language } = useLanguage()
  const pathname = usePathname()
  const isEnglish = language === 'en'
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [cookieBannerHeight, setCookieBannerHeight] = useState(0)

  useEffect(() => {
    let banner: HTMLElement | null = null
    let resizeObserver: ResizeObserver | null = null

    const updateBanner = () => {
      const nextBanner = document.querySelector<HTMLElement>('[data-cookie-consent-banner]')
      if (nextBanner !== banner) {
        resizeObserver?.disconnect()
        banner = nextBanner
        if (banner) {
          resizeObserver = new ResizeObserver(() => {
            setCookieBannerHeight(banner?.getBoundingClientRect().height ?? 0)
          })
          resizeObserver.observe(banner)
        }
      }

      setCookieBannerHeight(banner?.getBoundingClientRect().height ?? 0)
    }

    const mutationObserver = new MutationObserver(updateBanner)
    mutationObserver.observe(document.body, { childList: true, subtree: true })
    let resizeFrame = 0
    const handleResize = () => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(updateBanner)
    }
    window.addEventListener('resize', handleResize)
    updateBanner()

    return () => {
      mutationObserver.disconnect()
      resizeObserver?.disconnect()
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(resizeFrame)
    }
  }, [])

  useEffect(() => {
    const handleOpenAssistant = () => {
      if (!pathname.startsWith('/auth/')) {
        setOpen(true)
        setShowHint(false)
      }
    }
    const handleMoreMenuChange = (event: Event) => {
      const isMoreOpen = (event as CustomEvent<boolean>).detail
      setMoreOpen(isMoreOpen)
      if (isMoreOpen) {
        setOpen(false)
        setShowHint(false)
      }
    }
    window.addEventListener('open-maien-assistant', handleOpenAssistant)
    window.addEventListener('mobile-more-menu-change', handleMoreMenuChange)
    return () => {
      window.removeEventListener('open-maien-assistant', handleOpenAssistant)
      window.removeEventListener('mobile-more-menu-change', handleMoreMenuChange)
    }
  }, [pathname])

  if (pathname.startsWith('/auth/')) return null

  return (
    <>
      <div
        id="maien-assistant-panel"
        style={{
          '--cookie-banner-height': `${cookieBannerHeight}px`,
          maxHeight: cookieBannerHeight > 0
            ? `min(74vh, 620px, calc(100dvh - ${cookieBannerHeight}px - 10rem))`
            : undefined,
        } as React.CSSProperties}
        className={`fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom)+var(--cookie-banner-height)+3.5rem)] left-3 right-3 top-[calc(env(safe-area-inset-top)+4.5rem)] z-40 w-auto flex-col overflow-hidden border border-border bg-card shadow-2xl md:bottom-[calc(1.75rem+var(--cookie-banner-height)+3.5rem)] md:left-auto md:right-6 md:top-auto md:w-[min(31rem,calc(100vw-3rem))] ${open ? 'flex' : 'hidden'}`}
        role="dialog"
        aria-label={isEnglish ? 'Maien product assistant' : 'Asistente de productos Maien'}
        aria-modal="false"
      >
        <MaienCard onClose={() => setOpen(false)} />
      </div>

      <div
        style={{ '--cookie-banner-height': `${cookieBannerHeight}px` } as React.CSSProperties}
        className={`fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom)+var(--cookie-banner-height))] z-50 flex max-w-[calc(100vw-1.5rem)] items-end gap-2 md:bottom-[calc(1.75rem+var(--cookie-banner-height))] ${moreOpen ? 'left-3 right-auto md:left-auto md:right-6' : 'left-auto right-3 md:right-6'}`}
      >
        {!open && showHint && cookieBannerHeight === 0 && (
          <div className="mb-1 max-w-56 border border-border bg-card px-3 py-2 text-xs leading-relaxed text-foreground shadow-lg">
            {isEnglish ? 'I can analyze your skin and find products that suit you.' : 'Analizo tu piel y te digo qué productos te sirven.'}
          </div>
        )}
        <Button
          type="button"
          onClick={() => { setOpen((current) => !current); setShowHint(false) }}
          className="h-12 shrink-0 rounded-full bg-accent px-5 text-accent-foreground shadow-xl hover:bg-accent/90"
          aria-expanded={open}
          aria-controls="maien-assistant-panel"
          aria-label={open ? (isEnglish ? 'Close Maien' : 'Cerrar Maien') : 'Maien'}
        >
          <span>Maien</span>
        </Button>
      </div>
    </>
  )
}
