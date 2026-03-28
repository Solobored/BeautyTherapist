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
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span className="sr-only">TikTok</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0a12 12 0 0 0-4.373 23.178c-.01-.937-.002-2.064.236-3.082l1.705-7.227s-.422-.845-.422-2.093c0-1.96 1.137-3.423 2.552-3.423 1.204 0 1.785.904 1.785 1.988 0 1.212-.771 3.024-1.17 4.705-.333 1.406.705 2.552 2.091 2.552 2.51 0 4.196-3.227 4.196-7.05 0-2.906-1.959-5.08-5.523-5.08-4.026 0-6.537 3.002-6.537 6.356 0 1.156.341 1.972.877 2.602.246.291.28.408.19.742-.063.245-.21.838-.27 1.073-.088.343-.362.466-.666.339-1.858-.758-2.723-2.793-2.723-5.082 0-3.779 3.188-8.316 9.513-8.316 5.088 0 8.435 3.68 8.435 7.631 0 5.228-2.907 9.13-7.193 9.13-1.44 0-2.795-.778-3.259-1.66l-.887 3.502c-.27.987-.79 1.975-1.27 2.745A12 12 0 1 0 12 0z"/>
                </svg>
                <span className="sr-only">Pinterest</span>
              </a>
            </div>
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
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
