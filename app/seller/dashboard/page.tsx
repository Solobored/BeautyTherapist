'use client'

import { useEffect, useState } from 'react'
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
  ClipboardList
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SellerProfileEditor } from '@/components/seller-profile-editor'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { mockOrders } from '@/lib/data'
import { useProducts } from '@/hooks/use-products'
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

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800'
}

export default function SellerDashboardPage() {
  const { language, t } = useLanguage()
  const { seller, isAuthenticated, logout } = useAuth()
  const { products, loading } = useProducts()
  const router = useRouter()
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/seller/login')
    }
  }, [isAuthenticated, router])
  
  if (!isAuthenticated || !seller) {
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
  
  // Calculate revenue and sales from mock orders (real data would come from Supabase)
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0)
  const totalSales = mockOrders.length
  const totalRevenueLastMonth = totalRevenue * 0.85 // Mock calculation
  const totalSalesLastMonth = Math.max(1, totalSales - 2)
  
  const revenueChange = totalRevenueLastMonth > 0 
    ? ((totalRevenue - totalRevenueLastMonth) / totalRevenueLastMonth * 100).toFixed(1)
    : '0'
  const salesChange = totalSalesLastMonth > 0
    ? ((totalSales - totalSalesLastMonth) / totalSalesLastMonth * 100).toFixed(1)
    : '0'
  
  const lowStockProducts = products.filter(p => p.stock < 10 && p.status === 'active')
  
  // Most viewed products
  const mostViewedProducts = products
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 5)
  
  // Monthly revenue chart data
  const monthlyRevenueData = [
    { month: 'Ene', revenue: totalRevenue * 0.6 },
    { month: 'Feb', revenue: totalRevenue * 0.75 },
    { month: 'Mar', revenue: totalRevenue * 0.85 },
    { month: 'Abr', revenue: totalRevenue * 0.9 },
    { month: 'May', revenue: totalRevenue * 1.0 }
  ]
  
  // Categories data for sales by category
  const salesByCategoryData = [
    { category: 'Skincare', sales: Math.round(totalSales * 0.6) },
    { category: 'Makeup', sales: Math.round(totalSales * 0.4) }
  ]
  
  const handleLogout = () => {
    logout()
    router.push('/seller/login')
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/seller/dashboard" className="font-serif text-xl font-semibold">
              Beauty Therapist
            </Link>
            
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
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
        
        {/* Brand Profile Editor */}
        <div className="mb-8 max-w-2xl">
          <SellerProfileEditor
            brandName={seller.brandName}
            brandLogo={seller.brandLogo}
            brandBanner={seller.brandBanner}
            brandDescription={seller.brandDescription}
            onSave={async (data) => {
              setIsLoadingProfile(true)
              try {
                await new Promise(resolve => setTimeout(resolve, 500))
                // Here you would normally call an update function
                // updateSellerProfile(data)
                setSuccessMessage(language === 'es' ? '¡Marca actualizada!' : 'Brand updated!')
                setTimeout(() => setSuccessMessage(''), 3000)
              } finally {
                setIsLoadingProfile(false)
              }
            }}
            isLoading={isLoadingProfile}
          />
        </div>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('dashboard.totalRevenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className={`text-xs flex items-center gap-1 ${Number(revenueChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Number(revenueChange) >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {revenueChange}% {t('dashboard.vsLastMonth')}
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
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className={`text-xs flex items-center gap-1 ${Number(salesChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Number(salesChange) >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {salesChange}% {t('dashboard.vsLastMonth')}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                  {mockOrders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{order.product}</TableCell>
                      <TableCell>{formatClp(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[order.status]}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
        <Card className="mt-6">
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
      </main>
    </div>
  )
}
