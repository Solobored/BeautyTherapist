'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Eye, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Store,
  LogOut,
  ArrowUp,
  ArrowDown,
  FileText,
  ClipboardList,
  Star,
  Trash2,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { SellerProfileEditor } from '@/components/seller-profile-editor'
import { SellerAccountCredentialsCard } from '@/components/seller/SellerAccountCredentialsCard'
import { ShippingGroupsManager } from '@/components/seller/ShippingGroupsManager'
import { SellerVideosManager } from '@/components/seller/SellerVideosManager'
import { ShippingLocationsMap } from '@/components/seller/ShippingLocationsMap'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { useSellerProducts, sellerApiHeaders } from '@/hooks/use-seller-products'
import { brandNameToSlug } from '@/lib/seller-utils'
import { formatClp } from '@/lib/utils'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-muted text-muted-foreground',
}

type SellerOrderRow = {
  id: string
  buyerName: string
  buyerEmail?: string
  buyerPhone?: string | null
  items: { name: string; quantity: number }[]
  total: number
  orderStatus: string
  createdAt: string
  shippingAddress?: Record<string, any> | null
  subtotal?: number
  shippingCost?: number
  discount?: number
  paymentStatus?: string
}

type SellerAnalytics = {
  totalRevenue: number
  totalSales: number
  revenueThisMonth: number
  salesThisMonth: number
  totalRevenueLastMonth: number
  totalSalesLastMonth: number
  revenueByMonth: { month: string; revenue: number }[]
  salesByCategory: { category: string; revenue: number }[]
}

type CustomReview = {
  id: string
  customerName: string
  text: string
  rating: number
}

export default function SellerDashboardPage() {
  const { language, t } = useLanguage()
  const { seller, isAuthenticated, isAuthLoading, logout, updateSellerProfile } = useAuth()
  const { products, loading } = useSellerProducts()
  const router = useRouter()
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [sellerOrders, setSellerOrders] = useState<SellerOrderRow[]>([])
  const [orderAnalytics, setOrderAnalytics] = useState<SellerAnalytics | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const profileFetched = useRef(false)
  
  // Custom reviews state
  const [customReviews, setCustomReviews] = useState<CustomReview[]>([])
  const [newReview, setNewReview] = useState({ customerName: '', text: '', rating: 5 })
  const [isAddingReview, setIsAddingReview] = useState(false)
  
  // Featured products state
  const [featuredProductIds, setFeaturedProductIds] = useState<string[]>([])
  const [isSavingFeatured, setIsSavingFeatured] = useState(false)
  
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/seller/login')
    }
  }, [isAuthLoading, isAuthenticated, router])

  useEffect(() => {
    if (!seller?.email) return
    let cancelled = false

    // Cargar perfil del vendedor solo una vez para evitar loop de renders
    if (!profileFetched.current) {
      profileFetched.current = true
      ;(async () => {
        try {
          const res = await fetch('/api/seller/profile', { headers: sellerApiHeaders(seller) })
          const json = await res.json().catch(() => ({}))
          if (!cancelled && res.ok && json.brand) {
            const b = json.brand
            updateSellerProfile({
              brandName: b.brand_name ?? seller.brandName,
              brandLogo: b.logo_url ?? seller.brandLogo,
              brandBanner: b.banner_url ?? seller.brandBanner,
              brandDescription: b.description ?? seller.brandDescription,
              facebookUrl: b.facebook_url ?? seller.facebookUrl,
              instagramUrl: b.instagram_url ?? seller.instagramUrl,
              tiktokUrl: b.tiktok_url ?? seller.tiktokUrl,
            })
            // Load custom reviews and featured products
            if (b.custom_reviews) {
              setCustomReviews(b.custom_reviews)
            }
            if (b.featured_product_ids) {
              setFeaturedProductIds(b.featured_product_ids)
            }
          }
        } catch {
          /* ignore */
        }
      })()
    }

    ;(async () => {
      setOrdersLoading(true)
      try {
        const res = await fetch('/api/seller/orders', { headers: sellerApiHeaders(seller) })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'orders')
        const raw = (json.orders ?? []) as any[]
        if (!cancelled) {
          setSellerOrders(
            raw.map((o) => ({
              id: o.id,
              buyerName: o.buyerName,
              buyerEmail: o.buyerEmail,
              buyerPhone: o.buyerPhone,
              items: o.items ?? [],
              total: o.total,
              orderStatus: o.orderStatus,
              createdAt: o.createdAt,
              shippingAddress: o.shippingAddress ?? null,
              subtotal: o.subtotal,
              shippingCost: o.shippingCost,
              discount: o.discount,
              paymentStatus: o.paymentStatus,
            }))
          )
          const a = json.analytics as SellerAnalytics | undefined
          setOrderAnalytics(a ?? null)
        }
      } catch {
        if (!cancelled) {
          setSellerOrders([])
          setOrderAnalytics(null)
        }
      } finally {
        if (!cancelled) setOrdersLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    return () => {
      cancelled = true
    }
  }, [seller?.email, updateSellerProfile, seller])
  
  if (isAuthLoading || !isAuthenticated || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    )
  }
  
  // Calculate real metrics from products
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
  const totalProducts = products.filter(p => p.status === 'active').length

  const totalRevenue = orderAnalytics?.totalRevenue ?? 0
  const totalSales = orderAnalytics?.totalSales ?? 0
  const revPrev = orderAnalytics?.totalRevenueLastMonth ?? 0
  const salesPrev = orderAnalytics?.totalSalesLastMonth ?? 0
  const revThis = orderAnalytics?.revenueThisMonth ?? 0
  const salesThis = orderAnalytics?.salesThisMonth ?? 0

  const revenueChange =
    revPrev > 0
      ? (((revThis - revPrev) / revPrev) * 100).toFixed(1)
      : revThis > 0
        ? '100'
        : '0'
  const salesChange =
    salesPrev > 0
      ? (((salesThis - salesPrev) / salesPrev) * 100).toFixed(1)
      : salesThis > 0
        ? '100'
        : '0'
  
  const lowStockProducts = products.filter(p => p.stock < 10 && p.status === 'active')
  
  // Most viewed products
  const mostViewedProducts = products
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 5)
  
  const monthlyRevenueData =
    orderAnalytics?.revenueByMonth?.length ? orderAnalytics.revenueByMonth : [{ month: '—', revenue: 0 }]

  const salesByCategoryData = (orderAnalytics?.salesByCategory?.length
    ? orderAnalytics.salesByCategory
    : [{ category: '—', revenue: 0 }]
  ).map((row) => ({ category: row.category, sales: row.revenue }))

  const recentOrdersForTable = sellerOrders
    .filter((o) => o.orderStatus !== 'cancelled')
    .slice(0, 5)
  
  const handleLogout = async () => {
    await logout()
  }

  const handleAddReview = async () => {
    if (!newReview.customerName || !newReview.text) return
    
    setIsAddingReview(true)
    try {
      const review: CustomReview = {
        id: Date.now().toString(),
        customerName: newReview.customerName,
        text: newReview.text,
        rating: newReview.rating
      }
      
      const updatedReviews = [...customReviews, review]
      setCustomReviews(updatedReviews)
      
      const res = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: {
          ...sellerApiHeaders(seller),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customReviews: updatedReviews }),
      })
      
      if (!res.ok) throw new Error('Failed to save review')
      
      setNewReview({ customerName: '', text: '', rating: 5 })
      setSuccessMessage(language === 'es' ? '¡Reseña agregada!' : 'Review added!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (e) {
      console.error(e)
      setSuccessMessage(language === 'es' ? 'Error al agregar reseña' : 'Failed to add review')
    } finally {
      setIsAddingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const updatedReviews = customReviews.filter(r => r.id !== reviewId)
      setCustomReviews(updatedReviews)
      
      const res = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: {
          ...sellerApiHeaders(seller),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customReviews: updatedReviews }),
      })
      
      if (!res.ok) throw new Error('Failed to delete review')
      
      setSuccessMessage(language === 'es' ? '¡Reseña eliminada!' : 'Review deleted!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  const toggleFeaturedProduct = async (productId: string) => {
    setIsSavingFeatured(true)
    try {
      const updatedFeatured = featuredProductIds.includes(productId)
        ? featuredProductIds.filter(id => id !== productId)
        : [...featuredProductIds, productId]
      
      setFeaturedProductIds(updatedFeatured)
      
      const res = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: {
          ...sellerApiHeaders(seller),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featuredProductIds: updatedFeatured }),
      })
      
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        console.error('API Error:', json)
        throw new Error(json.error || json.details || 'Failed to update featured products')
      }
      
      setSuccessMessage(language === 'es' ? '¡Productos destacados actualizados!' : 'Featured products updated!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (e) {
      console.error(e)
      setSuccessMessage(language === 'es' ? `Error: ${e instanceof Error ? e.message : 'Failed to update'}` : `Error: ${e instanceof Error ? e.message : 'Failed to update'}`)
    } finally {
      setIsSavingFeatured(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/seller/dashboard" className="font-serif text-xl font-semibold">
              <span className="md:hidden">B&T</span>
              <span className="hidden md:inline">Beauty & Therapy</span>
            </Link>
            
            {/* Acciones desktop */}
            <div className="hidden md:flex flex-wrap items-center gap-2 md:gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href={`/brands/${brandNameToSlug(seller.brandName)}`}>
                  <Store className="h-4 w-4 mr-2" />
                  {t('dashboard.viewStore')}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/seller/products">
                  <Package className="h-4 w-4 mr-2" />
                  Productos
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/seller/orders">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Pedidos
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/seller/blog">
                  <FileText className="h-4 w-4 mr-2" />
                  Blog
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/seller/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dashboard.addProduct')}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Acciones mobile: barra desplazable */}
            <div className="md:hidden flex-1 flex justify-end">
              <div className="flex items-center gap-2 overflow-x-auto px-2 py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <Button asChild variant="outline" size="icon" className="shrink-0">
                  <Link href={`/brands/${brandNameToSlug(seller.brandName)}`}>
                    <Store className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon" className="shrink-0">
                  <Link href="/seller/products">
                    <Package className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon" className="shrink-0">
                  <Link href="/seller/orders">
                    <ClipboardList className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon" className="shrink-0">
                  <Link href="/seller/blog">
                    <FileText className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="icon" className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0">
                  <Link href="/seller/products/new">
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="shrink-0">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-700 border border-green-200">
            {successMessage}
          </div>
        )}
        
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            {t('dashboard.welcome')}, {seller.brandName}
          </h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.thisMonth')}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resumen" className="space-y-6">
          <TabsList className="w-full overflow-x-auto justify-start md:justify-center">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="mi-marca">Mi Marca</TabsTrigger>
            <TabsTrigger value="envios">Metodos de Envio</TabsTrigger>
            <TabsTrigger value="videos">Mis Videos</TabsTrigger>
            <TabsTrigger value="reseñas">Reseñas</TabsTrigger>
            <TabsTrigger value="productos-destacados">Productos Destacados</TabsTrigger>
          </TabsList>

          {/* Tab: Resumen */}
          <TabsContent value="resumen" className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('dashboard.totalRevenue')}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {ordersLoading ? '…' : formatClp(totalRevenue)}
                  </div>
                  <p className={`text-xs flex items-center gap-1 ${Number(revenueChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(revenueChange) >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {ordersLoading ? '—' : `${revenueChange}%`} {t('dashboard.vsLastMonth')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('dashboard.totalSales')}
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ordersLoading ? '…' : totalSales}</div>
                  <p className={`text-xs flex items-center gap-1 ${Number(salesChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(salesChange) >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {ordersLoading ? '—' : `${salesChange}%`} {t('dashboard.vsLastMonth')}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('dashboard.availableStock')}
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStock}</div>
                  <p className="text-xs text-muted-foreground">{t('common.units')}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {language === 'es' ? 'Productos' : 'Products'}
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'es' ? 'productos activos' : 'active products'}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t('dashboard.monthlyRevenue')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#9B7EC8" 
                        strokeWidth={2}
                        dot={{ fill: '#9B7EC8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.salesByCategory')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salesByCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="sales" fill="#C8B8E8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Shipping Locations Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📍 Mapa de Puntos de Envío
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Visualiza todos los puntos de entrega de tus pedidos que tienen geolocalización
                </p>
              </CardHeader>
              <CardContent>
                <ShippingLocationsMap 
                  locations={sellerOrders
                    .filter(order => (order as any).shippingAddress?.lat && (order as any).shippingAddress?.lng)
                    .map(order => ({
                      orderId: order.id,
                      lat: (order as any).shippingAddress?.lat,
                      lng: (order as any).shippingAddress?.lng,
                      buyerName: order.buyerName,
                      city: (order as any).shippingAddress?.city || 'Ciudad desconocida'
                    }))
                  }
                />
              </CardContent>
            </Card>
            
            {/* Recent Orders & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t('dashboard.recentOrders')}</CardTitle>
                  <Link href="/seller/orders" className="text-sm text-accent hover:underline">
                    Ver todos
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {ordersLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            …
                          </TableCell>
                        </TableRow>
                      ) : recentOrdersForTable.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Aún no hay pedidos con tus productos.
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentOrdersForTable.map((order) => {
                          const first = order.items[0]
                          const label =
                            first != null
                              ? order.items.length > 1
                                ? `${first.name} (+${order.items.length - 1})`
                                : first.name
                              : '—'
                          const st = order.orderStatus
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}…</TableCell>
                              <TableCell>{order.buyerName}</TableCell>
                              <TableCell className="max-w-[150px] truncate">{label}</TableCell>
                              <TableCell>{formatClp(order.total)}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={statusColors[st] ?? 'bg-muted'}>
                                  {order.orderStatus}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Low Stock Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    {t('dashboard.lowStock')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lowStockProducts.length > 0 ? (
                    <div className="space-y-3">
                      {lowStockProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{language === 'es' ? product.nameEs : product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.stock} {t('common.units')} left</p>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/seller/products/${product.id}`}>Restock</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      All products are well stocked
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Best Selling */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.bestSelling')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {mostViewedProducts.slice(0, 3).map((product, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center font-bold text-accent">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{language === 'es' ? product.nameEs : product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.reviewCount} {language === 'es' ? 'reseñas' : 'reviews'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Mi Marca */}
          <TabsContent value="mi-marca" className="space-y-6">
            <div className="max-w-2xl">
              <SellerProfileEditor
                brandName={seller.brandName}
                brandLogo={seller.brandLogo}
                brandBanner={seller.brandBanner}
                brandDescription={seller.brandDescription}
                facebookUrl={seller.facebookUrl}
                instagramUrl={seller.instagramUrl}
                tiktokUrl={seller.tiktokUrl}
                onSave={async (data) => {
                  setIsLoadingProfile(true)
                  try {
                    const res = await fetch('/api/seller/profile', {
                      method: 'PUT',
                      headers: {
                        ...sellerApiHeaders(seller),
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(data),
                    })
                    const json = await res.json().catch(() => ({}))
                    if (!res.ok) throw new Error(json.error || 'No se pudo guardar la marca')
                    updateSellerProfile({
                      ...data,
                    })
                    setSuccessMessage(language === 'es' ? '¡Marca actualizada!' : 'Brand updated!')
                    setTimeout(() => setSuccessMessage(''), 3000)
                  } catch (e) {
                    console.error(e)
                    setSuccessMessage(language === 'es' ? 'No se pudo guardar. Intenta de nuevo.' : 'Save failed. Try again.')
                  } finally {
                    setIsLoadingProfile(false)
                  }
                }}
                isLoading={isLoadingProfile}
              />
            </div>

            <div className="max-w-2xl">
              <SellerAccountCredentialsCard />
            </div>
          </TabsContent>

          <TabsContent value="envios" className="space-y-6">
            <ShippingGroupsManager
              seller={seller}
              products={products.map((product) => ({
                id: product.id,
                name: product.name,
                nameEs: product.nameEs,
                shippingMode: product.shippingMode,
                shippingGroupId: product.shippingGroupId,
                netContentMl: product.netContentMl,
                weightOverrideG: product.weightOverrideG,
              }))}
            />
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <SellerVideosManager
              seller={seller}
              products={products.map((product) => ({
                id: product.id,
                name: product.name,
                nameEs: product.nameEs,
              }))}
            />
          </TabsContent>

          {/* Tab: Reseñas */}
          <TabsContent value="reseñas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Reseña de Cliente</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Agrega experiencias de tus clientes para mostrarlas en tu página pública
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nombre del Cliente</label>
                  <Input
                    placeholder="Ej: María García"
                    value={newReview.customerName}
                    onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Reseña</label>
                  <Input
                    placeholder="Ej: ¡Excelentes productos, muy recomendados!"
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Puntuación</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`p-2 rounded ${star <= newReview.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        <Star className={`h-6 w-6 ${star <= newReview.rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddReview} disabled={isAddingReview}>
                  {isAddingReview ? 'Agregando...' : 'Agregar Reseña'}
                </Button>
              </CardContent>
            </Card>

            {customReviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reseñas Agregadas ({customReviews.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customReviews.map((review) => (
                      <div key={review.id} className="flex items-start justify-between p-4 bg-secondary/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{review.customerName}</span>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.text}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {customReviews.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No has agregado reseñas todavía. Agrega la primera arriba.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Productos Destacados */}
          <TabsContent value="productos-destacados" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Productos Destacados</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Estos productos aparecerán primero en tu página pública antes que el catálogo general
                </p>
              </CardHeader>
              <CardContent>
                {isSavingFeatured && (
                  <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                    Guardando cambios...
                  </div>
                )}
                <div className="space-y-3 overflow-x-auto">
                  {products.filter(p => p.status === 'active').map((product) => {
                    const isFeatured = featuredProductIds.includes(product.id)
                    return (
                      <div
                        key={product.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border-2 transition-colors gap-3 ${
                          isFeatured ? 'border-accent bg-accent/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{language === 'es' ? product.nameEs : product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatClp(product.price)} · Stock: {product.stock}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={isFeatured ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleFeaturedProduct(product.id)}
                          disabled={isSavingFeatured}
                          className="w-full sm:w-auto shrink-0"
                        >
                          {isFeatured ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Destacado
                            </>
                          ) : (
                            'Marcar como destacado'
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
                {products.filter(p => p.status === 'active').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No tienes productos activos. Ve a la sección de productos para crear algunos.
                  </p>
                )}
              </CardContent>
            </Card>

            {featuredProductIds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Productos Destacados Seleccionados ({featuredProductIds.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products
                      .filter(p => featuredProductIds.includes(p.id))
                      .map((product) => (
                        <div key={product.id} className="p-4 bg-accent/10 rounded-lg border border-accent">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                              {product.imageUrl && (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{language === 'es' ? product.nameEs : product.name}</p>
                              <p className="text-sm text-muted-foreground">{formatClp(product.price)}</p>
                            </div>
                            <Badge variant="secondary">Destacado</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
