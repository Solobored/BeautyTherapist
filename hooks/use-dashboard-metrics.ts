import { useState, useEffect } from 'react'

export interface DashboardOrder {
  id: string
  customerName: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
  items: Array<{ name: string; quantity: number; price: number }>
}

export interface DashboardMetrics {
  totalRevenue: number
  totalRevenueLastMonth: number
  totalSales: number
  totalSalesLastMonth: number
  availableStock: number
  mostViewedCount: number
}

export function useDashboardMetrics(products: any[]) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalRevenueLastMonth: 0,
    totalSales: 0,
    totalSalesLastMonth: 0,
    availableStock: 0,
    mostViewedCount: 0
  })

  useEffect(() => {
    if (!products || products.length === 0) return

    // Calculate available stock
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
    
    // Calculate most viewed (using mock data for now - would be real analytics)
    const mostViewed = Math.max(...products.map(p => p.reviewCount || 0), 0)

    setMetrics(prev => ({
      ...prev,
      availableStock: totalStock,
      mostViewedCount: mostViewed
    }))
  }, [products])

  return metrics
}

export function useRecentOrders(orders?: DashboardOrder[]) {
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([])

  useEffect(() => {
    if (!orders) return
    
    // Sort by date and get the 5 most recent
    const sorted = [...orders].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 5)
    
    setRecentOrders(sorted)
  }, [orders])

  return recentOrders
}
