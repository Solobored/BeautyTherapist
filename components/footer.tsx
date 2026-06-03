'use client'

import Link from 'next/link'
import { Instagram, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

export function Footer() {
  const { t } = useLanguage()
  
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                Beauty & Therapy
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6">
              {t('footer.tagline')}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
              {t('footer.shop')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.shop')}
                </Link>
              </li>
              <li>
                <Link href="/productos-profesionales-belleza" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Productos profesionales de belleza
                </Link>
              </li>
              <li>
                <Link href="/skincare-profesional" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Skincare profesional
                </Link>
              </li>
              <li>
                <Link href="/maquillaje-profesional" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Maquillaje profesional
                </Link>
              </li>
              <li>
                <Link href="/brands/angebae" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.brands')}
                </Link>
              </li>
              <li>
                <Link href="/seller/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.sellWithUs')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.blog')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/politicas/compra-venta" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Políticas de compra y venta
                </Link>
              </li>
              <li>
                <Link href="/politicas/devoluciones" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cambios y devoluciones
                </Link>
              </li>
              <li>
                <Link href="/politicas/privacidad" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
              {t('footer.newsletter')}
            </h3>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input 
                type="email" 
                placeholder={t('footer.emailPlaceholder')}
                className="bg-background"
              />
              <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Beauty & Therapy. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
