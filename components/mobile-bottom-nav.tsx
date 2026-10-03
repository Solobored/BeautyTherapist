'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clapperboard, Home, MoreHorizontal, ShoppingCart, Store } from 'lucide-react'
import { CartDrawer } from '@/components/cart-drawer'
import { useCart } from '@/contexts/cart-context'
import { useLanguage } from '@/contexts/language-context'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { itemCount, setIsOpen } = useCart()
  const links = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/shop', label: t('nav.shop'), icon: Store },
    { href: '/videos', label: 'Videos', icon: Clapperboard },
  ]

  return (
    <>
      <nav
        aria-label="Navegación móvil"
        className="fixed inset-x-0 bottom-0 z-60 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(45,45,45,0.08)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid h-16 max-w-xl grid-cols-5">
          <Link
            href="/"
            aria-current={pathname === '/' ? 'page' : undefined}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium ${pathname === '/' ? 'text-accent' : 'text-muted-foreground'}`}
          >
            <Home className="size-5" />
            <span>{t('nav.home')}</span>
          </Link>
          <Link
            href="/shop"
            aria-current={pathname.startsWith('/shop') ? 'page' : undefined}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium ${pathname.startsWith('/shop') ? 'text-accent' : 'text-muted-foreground'}`}
          >
            <Store className="size-5" />
            <span>{t('nav.shop')}</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir carrito"
            className="flex min-w-0 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-foreground"
          >
            <span className="relative -mt-4 flex size-11 items-center justify-center rounded-full border-4 border-background bg-accent text-accent-foreground shadow-md">
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                  {itemCount}
                </span>
              )}
            </span>
            <span>Carrito</span>
          </button>
          <Link
            href="/videos"
            aria-current={pathname.startsWith('/videos') ? 'page' : undefined}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium ${pathname.startsWith('/videos') ? 'text-accent' : 'text-muted-foreground'}`}
          >
            <Clapperboard className="size-5" />
            <span>Videos</span>
          </Link>
          <Link
            href="/mas"
            aria-current={pathname === '/mas' ? 'page' : undefined}
            aria-label="Más opciones"
            className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium ${pathname === '/mas' ? 'text-accent' : 'text-muted-foreground'}`}
          >
            <MoreHorizontal className="size-5" />
            <span>Más</span>
          </Link>
        </div>
      </nav>
      <CartDrawer />
    </>
  )
}
