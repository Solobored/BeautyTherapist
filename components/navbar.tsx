'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Search, ShoppingBag, User, Menu, X, Heart, ChevronDown, LogOut, Package, Ticket, MapPin, Settings, LayoutDashboard, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'
import { CartDrawer } from '@/components/cart-drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const { t } = useLanguage()
  const { itemCount, setIsOpen } = useCart()
  const { user, isAuthenticated, userType, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/shop', label: t('nav.shop') },
    { href: '/brands/angebae', label: t('nav.brands') },
    { href: '/blog', label: t('nav.blog') },
  ]
  
  const getBuyerName = () => {
    if (user?.type === 'buyer') {
      return user.fullName.split(' ')[0]
    }
    return ''
  }
  
  const getSellerBrandName = () => {
    if (user?.type === 'seller') {
      return user.brandName
    }
    return ''
  }
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                Beauty & Therapy
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search */}
              <Link href="/shop">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </Link>
              
              {/* Wishlist - Only for buyers */}
              {isAuthenticated && userType === 'buyer' && (
                <Link href="/account/wishlist">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Heart className="h-5 w-5" />
                    <span className="sr-only">Wishlist</span>
                  </Button>
                </Link>
              )}
              
              {/* Cart - Hide for sellers */}
              {userType !== 'seller' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(true)}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                      {itemCount}
                    </span>
                  )}
                  <span className="sr-only">Cart</span>
                </Button>
              )}
              
              {/* User Menu */}
              {!isAuthenticated ? (
                /* Logged Out State */
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      {t('nav.register')}
                    </Button>
                  </Link>
                </div>
              ) : userType === 'buyer' ? (
                /* Logged In as Buyer */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      {user?.type === 'buyer' && user.profilePhoto ? (
                        <Image 
                          src={user.profilePhoto} 
                          alt={user.fullName}
                          width={28}
                          height={28}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                      <span className="text-sm">Hi, {getBuyerName()}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/account/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" />
                        {t('nav.myAccount')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="flex items-center gap-2 cursor-pointer">
                        <Package className="h-4 w-4" />
                        {t('nav.myOrders')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/coupons" className="flex items-center gap-2 cursor-pointer">
                        <Ticket className="h-4 w-4" />
                        {t('nav.myCoupons')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/wishlist" className="flex items-center gap-2 cursor-pointer">
                        <Heart className="h-4 w-4" />
                        {t('nav.wishlist')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/addresses" className="flex items-center gap-2 cursor-pointer">
                        <MapPin className="h-4 w-4" />
                        {t('nav.addresses')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        {t('nav.settings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* Logged In as Seller */
                <div className="hidden sm:flex items-center gap-3">
                  {user?.type === 'seller' && user.brandLogo && (
                    <Image 
                      src={user.brandLogo} 
                      alt={user.brandName}
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-foreground">{getSellerBrandName()}</span>
                  <Link href="/seller/dashboard">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href={`/brands/${user?.type === 'seller' ? user.brandName.toLowerCase().replace(/\s+/g, '-') : ''}`}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Store className="h-4 w-4 mr-1" />
                      My Store
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {!isAuthenticated ? (
                <>
                  <Link 
                    href="/auth/login"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link 
                    href="/auth/register"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </>
              ) : userType === 'buyer' ? (
                <>
                  <div className="border-t border-border pt-4 mt-2">
                    <span className="text-sm font-semibold text-foreground">Hi, {getBuyerName()}</span>
                  </div>
                  <Link 
                    href="/account/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.myAccount')}
                  </Link>
                  <Link 
                    href="/account/orders"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.myOrders')}
                  </Link>
                  <Link 
                    href="/account/wishlist"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.wishlist')}
                  </Link>
                  <button
                    onClick={() => {
                      void logout()
                      setMobileMenuOpen(false)
                    }}
                    className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors py-2 text-left"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-border pt-4 mt-2">
                    <span className="text-sm font-semibold text-foreground">{getSellerBrandName()}</span>
                  </div>
                  <Link 
                    href="/seller/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/seller/products"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Products
                  </Link>
                  <button
                    onClick={() => {
                      void logout()
                      setMobileMenuOpen(false)
                    }}
                    className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors py-2 text-left"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
      
      <CartDrawer />
    </>
  )
}
