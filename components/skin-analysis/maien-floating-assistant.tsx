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
        className={`fixed bottom-23 left-3 right-3 z-40 max-h-[min(74vh,620px)] w-auto overflow-hidden border border-border bg-card shadow-2xl sm:bottom-20 sm:left-auto sm:right-6 sm:w-[min(31rem,calc(100vw-3rem))] ${open ? 'block' : 'hidden'}`}
        role="dialog"
        aria-label={isEnglish ? 'Maien product assistant' : 'Asistente de productos Maien'}
        aria-modal="false"
      >
        <MaienCard onClose={() => setOpen(false)} />
      </div>

      <div className={`fixed bottom-[5.7rem] z-50 flex max-w-[calc(100vw-1.5rem)] items-end gap-2 sm:bottom-6 sm:left-auto sm:right-6 ${moreOpen ? 'left-3 right-auto' : 'left-auto right-3'}`}>
        {!open && showHint && (
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
