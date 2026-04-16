'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import type { Product } from '@/hooks/use-products'
import { buildSellerApiHeaders } from '@/lib/seller-identity'

export function sellerApiHeaders(seller: { email: string; brandName: string }) {
  return buildSellerApiHeaders(seller)
}

export function useSellerProducts() {
  const { seller, isAuthLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (isAuthLoading) {
      setLoading(true)
      return
    }
    if (!seller?.email) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/seller/products', {
        headers: sellerApiHeaders(seller),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al cargar productos')
      setProducts(json.products ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [seller, isAuthLoading])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { products, loading, error, refresh }
}
