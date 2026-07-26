'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { formatClp } from '@/lib/utils'
import type { BuyerOrder } from '@/contexts/auth-context'

export default function OrdersPage() {
  const { language } = useLanguage()
  const { user, isAuthenticated, userType } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<BuyerOrder[]>(user?.type === 'buyer' ? user.orders : [])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!isAuthenticated || userType !== 'buyer') {
      router.push('/auth/login?returnUrl=/account/orders')
    }
  }, [isAuthenticated, userType, router])

  useEffect(() => {
    if (!user || user.type !== 'buyer') return

    let cancelled = false
    const loadOrders = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/account/orders?email=${encodeURIComponent(user.email)}&userId=${encodeURIComponent(user.id)}`)
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || 'No se pudieron cargar los pedidos')
        if (!cancelled) setOrders(json.orders ?? [])
      } catch {
        if (!cancelled) setOrders(user.type === 'buyer' ? user.orders : [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadOrders()
    return () => {
      cancelled = true
    }
  }, [user])
  
  if (!user || user.type !== 'buyer') {
    return null
  }
  
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
        <div className="mb-6">
          <Link href="/account/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Volver al Dashboard' : 'Back to Dashboard'}
            </Button>
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
            {language === 'es' ? 'Mis Pedidos' : 'My Orders'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'es' 
              ? `${orders.length} pedidos en total`
              : `${orders.length} orders total`}
          </p>
        </div>
        
        {loading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="w-10 h-10 mx-auto text-muted-foreground animate-spin mb-4" />
              <p className="text-muted-foreground">Cargando tus pedidos…</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {language === 'es' ? 'No tienes pedidos aun' : 'No orders yet'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'es' 
                  ? 'Cuando hagas tu primera compra, aparecera aqui'
                  : 'When you make your first purchase, it will appear here'}
              </p>
              <Link href="/shop">
                <Button>
                  {language === 'es' ? 'Explorar Tienda' : 'Explore Shop'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order: BuyerOrder) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-secondary/50 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-base">{order.id}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="space-y-4">
                    {order.items.map((item: BuyerOrder['items'][number], idx: number) => (
                      <div key={idx} className="flex items-center gap-4">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'es' ? 'Cantidad' : 'Qty'}: {item.quantity} x {formatClp(item.price)}
                          </p>
                        </div>
                        <p className="font-medium text-foreground">
                          {formatClp(item.quantity * item.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">
                        {language === 'es' ? 'Direccion de Envio' : 'Shipping Address'}
                      </p>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold text-foreground">{formatClp(order.total)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
