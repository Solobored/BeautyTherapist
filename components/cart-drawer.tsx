'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { useCart } from '@/contexts/cart-context'
import { formatClp } from '@/lib/utils'

export function CartDrawer() {
  const { language, t } = useLanguage()
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal } = useCart()
  
  if (!isOpen) return null
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl font-semibold">{t('cart.title')}</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t('cart.empty')}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/shop">{t('cart.continueShopping')}</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 p-3 bg-secondary/50 rounded-xl">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                    <Image
                      src={item.image}
                      alt={language === 'es' ? item.nameEs : item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-accent font-medium uppercase tracking-wide">{item.brand}</p>
                    <h3 className="font-medium text-sm truncate">{language === 'es' ? item.nameEs : item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{formatClp(item.price)}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4 bg-secondary/30">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('cart.subtotal')}</span>
              <span className="font-semibold text-lg">{formatClp(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t('cart.shipping')}: Calculated at checkout</p>
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              asChild
              onClick={() => setIsOpen(false)}
            >
              <Link href="/checkout">{t('cart.checkout')}</Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              <Link href="/shop">{t('cart.continueShopping')}</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
