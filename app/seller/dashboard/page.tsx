'use client'

import { useEffect } from 'react'
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
  ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { dashboardMetrics, mockOrders, products } from '@/lib/data'
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
  const router = useRouter()
  
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
  
  const revenueChange = ((dashboardMetrics.totalRevenue - dashboardMetrics.totalRevenueLastMonth) / dashboardMetrics.totalRevenueLastMonth * 100).toFixed(1)
  const salesChange = ((dashboardMetrics.totalSales - dashboardMetrics.totalSalesLastMonth) / dashboardMetrics.totalSalesLastMonth * 100).toFixed(1)
  
  const lowStockProducts = products.filter(p => p.stock < 10)
  
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
            
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href={`/brands/${seller.brandName.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Store className="h-4 w-4 mr-2" />
                  {t('dashboard.viewStore')}
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
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            {t('dashboard.welcome')}, {seller.brandName}
          </h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.thisMonth')}</p>
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
              <div className="text-2xl font-bold">${dashboardMetrics.totalRevenue.toLocaleString()}</div>
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
              <div className="text-2xl font-bold">{dashboardMetrics.totalSales}</div>
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
              <div className="text-2xl font-bold">{dashboardMetrics.availableStock}</div>
              <p className="text-xs text-muted-foreground">{t('common.units')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('dashboard.mostViewed')}
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {dashboardMetrics.mostViewedProducts.slice(0, 2).map((product, i) => (
                  <p key={i} className="text-xs truncate">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground ml-1">({product.views})</span>
                  </p>
                ))}
              </div>
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
                <LineChart data={dashboardMetrics.monthlyRevenue}>
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
                <BarChart data={dashboardMetrics.salesByCategory}>
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
                View all
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
                      <TableCell>${order.total}</TableCell>
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
              {dashboardMetrics.bestSellingProducts.map((product, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center font-bold text-accent">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sold} sold</p>
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
