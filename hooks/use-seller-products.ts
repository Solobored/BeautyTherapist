'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import type { Product } from '@/hooks/use-products'
import { brandNameToSlug } from '@/lib/seller-utils'

export function sellerApiHeaders(seller: { email: string; brandName: string }) {
  return {
    'x-seller-email': seller.email,
    'x-brand-slug': brandNameToSlug(seller.brandName),
    'x-brand-name': seller.brandName,
  } as Record<string, string>
}

export function useSellerProducts() {
  const { seller } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
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
  }, [seller])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { products, loading, error, refresh }
}
