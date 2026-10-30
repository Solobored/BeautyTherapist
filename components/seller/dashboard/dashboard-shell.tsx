'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ExternalLink, LogOut, MoreHorizontal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { NAV_GROUPS, PERIOD_SECTIONS, PRIMARY_MOBILE, SECTION_TITLES, type NavItem, type SectionId } from './nav-config'
import { PERIOD_OPTIONS, type PeriodDays } from './use-seller-finance'

type Props = {
  active: SectionId
  onNavigate: (id: SectionId) => void
  brandName: string
  brandLogo?: string
  storeHref: string
  period: PeriodDays
  onPeriodChange: (p: PeriodDays) => void
  onLogout: () => void
  children: ReactNode
}

function NavButton({ item, active, onNavigate, onDone, compact }: {
  item: NavItem; active: SectionId; onNavigate: (id: SectionId) => void; onDone?: () => void; compact?: boolean
}) {
  const Icon = item.icon
  const isActive = item.id === active
  const cls = cn(
    'group flex w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring',
    compact ? 'min-h-12 py-2.5' : 'py-1.5',
    isActive ? 'bg-accent text-accent-foreground shadow-xs' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  )
  const inner = (<><Icon className="size-4 shrink-0" aria-hidden /><span className="truncate">{item.label}</span></>)
  if (item.href) {
    return <Link href={item.href} className={cls} onClick={onDone}>{inner}</Link>
  }
  return (
    <button type="button" className={cls} aria-current={isActive ? 'page' : undefined}
      onClick={() => { onNavigate(item.id!); onDone?.() }}>
      {inner}
    </button>
  )
}

function Brand({ brandName, brandLogo }: { brandName: string; brandLogo?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/40 font-serif text-base font-semibold text-foreground">
        {brandLogo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={brandLogo} alt="" className="size-full object-cover" /> : brandName.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{brandName}</p>
        <p className="text-xs text-muted-foreground">Panel de vendedor</p>
      </div>
    </div>
  )
}

export function DashboardShell({
  active, onNavigate, brandName, brandLogo, storeHref, period, onPeriodChange, onLogout, children,
}: Props) {
  const [moreOpen, setMoreOpen] = useState(false)
  const showPeriod = PERIOD_SECTIONS.includes(active)
  const { title, subtitle } = SECTION_TITLES[active]
  const mobilePrimary = PRIMARY_MOBILE.map((id) => NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === id)!)
  const moreActive = !PRIMARY_MOBILE.includes(active)

  const periodSelect = (
    <Select value={String(period)} onValueChange={(v) => onPeriodChange(Number(v) as PeriodDays)}>
      <SelectTrigger size="sm" className="w-[11.5rem] bg-card" aria-label="Periodo"><SelectValue /></SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Sidebar escritorio */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-4 overflow-y-auto border-r bg-card/60 p-4 lg:flex" aria-label="Navegación del panel">
        <Link href="/seller/dashboard" className="px-2 pt-1 font-serif text-xl font-semibold text-foreground">Beauty &amp; Therapy</Link>
        <Brand brandName={brandName} brandLogo={brandLogo} />
        <nav className="flex flex-1 flex-col gap-3.5">
          {NAV_GROUPS.map((g) => (
            <div key={g.label}>
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{g.label}</p>
              <div className="flex flex-col gap-0.5">
                {g.items.map((i) => <NavButton key={i.label} item={i} active={active} onNavigate={onNavigate} />)}
              </div>
            </div>
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t pt-3">
          <Link href={storeHref} className="flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <ExternalLink className="size-4" aria-hidden /> Ver mi tienda
          </Link>
          <button type="button" onClick={onLogout} className="flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="size-4" aria-hidden /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barra superior */}
        <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[88rem] items-center justify-between gap-3 px-4 md:h-16 md:px-8">
            <div className="min-w-0">
              <p className="truncate font-serif text-lg font-semibold leading-tight text-foreground md:text-2xl">
                <span className="lg:hidden text-muted-foreground font-sans text-xs block font-medium -mb-0.5">{brandName}</span>
                {title}
              </p>
              <p className="hidden text-sm text-muted-foreground md:block">{subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {showPeriod && <div className="hidden sm:block">{periodSelect}</div>}
              <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/seller/products/new" aria-label="Agregar producto">
                  <Plus className="size-4" aria-hidden />
                  <span className="hidden md:inline">Agregar producto</span>
                </Link>
              </Button>
            </div>
          </div>
          {showPeriod && <div className="px-4 pb-3 sm:hidden">{periodSelect}</div>}
        </header>

        <main className="mx-auto max-w-[88rem] px-4 py-5 pb-28 md:px-8 md:py-8 lg:pb-10">{children}</main>
      </div>

      {/* Navegación inferior móvil */}
      <nav aria-label="Navegación del panel" className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(45,45,45,0.08)] backdrop-blur lg:hidden">
        <ul className="mx-auto grid h-16 max-w-xl grid-cols-5">
          {mobilePrimary.map((item) => {
            const Icon = item.icon
            const on = item.id === active
            return (
              <li key={item.id}>
                <button type="button" onClick={() => onNavigate(item.id!)} aria-current={on ? 'page' : undefined}
                  className={cn('flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] font-medium', on ? 'text-accent' : 'text-muted-foreground')}>
                  <span className={cn('flex h-7 w-12 items-center justify-center rounded-full transition-colors', on && 'bg-accent/15')}><Icon className="size-5" aria-hidden /></span>
                  {item.label}
                </button>
              </li>
            )
          })}
          <li>
            <button type="button" onClick={() => setMoreOpen(true)} aria-haspopup="dialog"
              className={cn('flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] font-medium', moreActive ? 'text-accent' : 'text-muted-foreground')}>
              <span className={cn('flex h-7 w-12 items-center justify-center rounded-full', moreActive && 'bg-accent/15')}><MoreHorizontal className="size-5" aria-hidden /></span>
              Más
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] gap-0 overflow-y-auto rounded-t-3xl p-0">
          <SheetHeader className="p-4 pb-2"><SheetTitle className="font-serif">Más opciones</SheetTitle></SheetHeader>
          <div className="space-y-4 p-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Brand brandName={brandName} brandLogo={brandLogo} />
            {NAV_GROUPS.map((g) => {
              const items = g.items.filter((i) => !i.id || !PRIMARY_MOBILE.includes(i.id))
              if (!items.length) return null
              return (
                <div key={g.label}>
                  <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{g.label}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {items.map((i) => <NavButton key={i.label} item={i} active={active} onNavigate={onNavigate} onDone={() => setMoreOpen(false)} compact />)}
                  </div>
                </div>
              )
            })}
            <div className="grid grid-cols-2 gap-1.5 border-t pt-3">
              <Link href={storeHref} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-muted"><ExternalLink className="size-4" aria-hidden /> Ver mi tienda</Link>
              <button type="button" onClick={onLogout} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-muted"><LogOut className="size-4" aria-hidden /> Cerrar sesión</button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
