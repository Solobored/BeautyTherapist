'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, ChevronRight, FileText, RotateCcw, ShieldCheck, Store, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

type MoreLink = {
  href: string
  label: string
  icon?: LucideIcon
}

export function MorePageContent() {
  const { user, isAuthenticated, isAuthLoading } = useAuth()
  const accountHref = user?.type === 'seller' ? '/seller/dashboard' : '/account/dashboard'
  const displayName = user?.type === 'seller' ? user.brandName : user?.fullName
  const profilePhoto = user?.type === 'buyer' ? user.profilePhoto : user?.brandLogo

  const mainLinks: MoreLink[] = [
    { href: '/brands/angebae', label: 'Marcas', icon: Store },
    { href: '/blog', label: 'Blog', icon: BookOpen },
  ]

  const policyLinks: MoreLink[] = [
    { href: '/politicas/compra-venta', label: 'Políticas de compra y venta', icon: FileText },
    { href: '/politicas/devoluciones', label: 'Cambios y devoluciones', icon: RotateCcw },
    { href: '/politicas/privacidad', label: 'Política de privacidad', icon: ShieldCheck },
  ]

  return (
    <div className="min-h-[calc(100dvh-8rem)] bg-background pb-28 lg:hidden">
      <section className="bg-primary/45 px-4 py-6 sm:px-6" aria-label="Cuenta">
        <div className="mx-auto max-w-2xl">
          {isAuthLoading ? (
            <div className="h-20 animate-pulse rounded-xl bg-background/50" aria-label="Cargando cuenta" />
          ) : isAuthenticated && user ? (
            <Link href={accountHref} className="flex min-h-20 items-center gap-4 text-foreground">
              <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-xl font-medium">
                {profilePhoto ? (
                  <Image src={profilePhoto} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <UserRound className="size-7" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xl font-semibold">{displayName}</span>
                <span className="mt-1 inline-flex items-center text-sm font-medium">
                  Mi perfil <ChevronRight className="ml-1 size-4" aria-hidden="true" />
                </span>
              </span>
            </Link>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-foreground">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-background">
                  <UserRound className="size-7" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-lg font-semibold">Tu cuenta</span>
                  <span className="block text-sm text-foreground/75">Inicia sesión o crea una cuenta</span>
                </span>
              </div>
              <div className="flex gap-2 sm:shrink-0">
                <Link href="/auth/login" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 sm:flex-none">
                  Iniciar sesión
                </Link>
                <Link href="/auth/register" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-foreground/20 bg-background/70 px-5 text-sm font-semibold text-foreground hover:bg-background sm:flex-none">
                  Crear cuenta
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 pt-3 sm:px-6">

        <nav aria-label="Más opciones">
          <section aria-label="Tu espacio" className="mb-6">
            {mainLinks.map((item) => (
              <MoreLinkRow key={item.href} item={item} />
            ))}
          </section>

          <section aria-labelledby="more-policies-heading" className="rounded-xl bg-secondary/70 px-4 sm:px-5">
            <h2 id="more-policies-heading" className="pt-4 text-sm font-semibold text-foreground">
              Ayuda y políticas
            </h2>
            <div className="mt-1">
              {policyLinks.map((item) => (
                <MoreLinkRow key={item.href} item={item} subdued />
              ))}
            </div>
          </section>
        </nav>
      </div>
    </div>
  )
}

function MoreLinkRow({ item, subdued = false }: { item: MoreLink; subdued?: boolean }) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={`flex min-h-14 items-center gap-4 border-b border-border/70 py-3 text-foreground transition-colors last:border-b-0 hover:text-accent ${subdued ? '' : 'px-2'}`}
    >
      {Icon && (
        <Icon className={`size-5 shrink-0 ${subdued ? 'text-muted-foreground' : 'text-foreground'}`} aria-hidden="true" />
      )}
      <span className="min-w-0 flex-1 text-[15px] font-medium leading-5">{item.label}</span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}