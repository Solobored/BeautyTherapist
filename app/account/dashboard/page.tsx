'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Heart, Ticket, MapPin, Settings, ChevronRight, TrendingUp, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function BuyerDashboardPage() {
  const { language } = useLanguage()
  const { user, isAuthenticated, userType } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isAuthenticated || userType !== 'buyer') {
      router.push('/auth/login?returnUrl=/account/dashboard')
    }
  }, [isAuthenticated, userType, router])
  
  if (!user || user.type !== 'buyer') {
    return null
  }
  
  const recentOrders = user.orders.slice(0, 3)
  const activeCoupons = user.coupons.filter(c => !c.used && new Date(c.expiryDate) > new Date())
  
  const quickLinks = [
    { href: '/account/orders', icon: Package, label: language === 'es' ? 'Mis Pedidos' : 'My Orders', count: user.orders.length },
    { href: '/account/wishlist', icon: Heart, label: language === 'es' ? 'Lista de Deseos' : 'Wishlist', count: user.wishlist.length },
    { href: '/account/coupons', icon: Ticket, label: language === 'es' ? 'Mis Cupones' : 'My Coupons', count: activeCoupons.length },
    { href: '/account/addresses', icon: MapPin, label: language === 'es' ? 'Direcciones' : 'Addresses', count: user.addresses.length },
    { href: '/account/settings', icon: Settings, label: language === 'es' ? 'Configuracion' : 'Settings' },
  ]
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'shipped': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-secondary text-secondary-foreground'
    }
  }
  
  const getStatusLabel = (status: string) => {
    const labels = {
      pending: { es: 'Pendiente', en: 'Pending' },
      shipped: { es: 'Enviado', en: 'Shipped' },
      delivered: { es: 'Entregado', en: 'Delivered' }
    }
    return labels[status as keyof typeof labels]?.[language] || status
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {user.profilePhoto ? (
              <Image
                src={user.profilePhoto}
                alt={user.fullName}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {user.fullName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                {language === 'es' ? 'Hola' : 'Hi'}, {user.fullName.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground">
                {language === 'es' ? 'Bienvenida a tu cuenta de belleza' : 'Welcome to your beauty account'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{user.orders.length}</p>
                  <p className="text-xs text-muted-foreground">{language === 'es' ? 'Pedidos' : 'Orders'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{user.wishlist.length}</p>
                  <p className="text-xs text-muted-foreground">{language === 'es' ? 'Favoritos' : 'Favorites'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Ticket className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeCoupons.length}</p>
                  <p className="text-xs text-muted-foreground">{language === 'es' ? 'Cupones' : 'Coupons'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    ${user.orders.reduce((acc, o) => acc + o.total, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">{language === 'es' ? 'Total Gastado' : 'Total Spent'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Links */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'es' ? 'Acceso Rapido' : 'Quick Access'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors group">
                      <div className="flex items-center gap-3">
                        <link.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-foreground">{link.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {link.count !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {link.count}
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
            
            {/* Active Coupons Preview */}
            {activeCoupons.length > 0 && (
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    {language === 'es' ? 'Cupones Activos' : 'Active Coupons'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeCoupons.slice(0, 2).map((coupon) => (
                    <div key={coupon.id} className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-foreground">{coupon.code}</span>
                        <Badge className="bg-primary text-primary-foreground">
                          {coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'es' ? 'Expira' : 'Expires'}: {new Date(coupon.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  <Link href="/account/coupons">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      {language === 'es' ? 'Ver todos los cupones' : 'View all coupons'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Recent Orders */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {language === 'es' ? 'Pedidos Recientes' : 'Recent Orders'}
                </CardTitle>
                <Link href="/account/orders">
                  <Button variant="ghost" size="sm">
                    {language === 'es' ? 'Ver todos' : 'View all'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      {language === 'es' ? 'Aun no tienes pedidos' : 'You have no orders yet'}
                    </p>
                    <Link href="/shop">
                      <Button className="mt-4">
                        {language === 'es' ? 'Explorar Tienda' : 'Explore Shop'}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <Image
                              key={idx}
                              src={item.image}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover border-2 border-background"
                            />
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{order.id}</span>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {order.items.map(i => i.name).join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">${order.total}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.items.length} {language === 'es' ? 'articulos' : 'items'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Beauty Preferences */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {language === 'es' ? 'Preferencias de Belleza' : 'Beauty Preferences'}
                </CardTitle>
                <Link href="/account/settings#preferences">
                  <Button variant="ghost" size="sm">
                    {language === 'es' ? 'Editar' : 'Edit'}
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'es' ? 'Tipo de Piel' : 'Skin Type'}
                    </p>
                    <p className="font-medium text-foreground capitalize">
                      {user.beautyPreferences.skinType || (language === 'es' ? 'No configurado' : 'Not set')}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'es' ? 'Preocupaciones' : 'Concerns'}
                    </p>
                    <p className="font-medium text-foreground">
                      {user.beautyPreferences.concerns.length > 0 
                        ? user.beautyPreferences.concerns.join(', ')
                        : (language === 'es' ? 'No configurado' : 'Not set')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
