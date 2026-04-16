'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { SellerProductForm, SellerProductFormHeader } from '@/components/seller/seller-product-form'

export default function NewProductPage() {
  const { t } = useLanguage()
  const { seller, isAuthenticated, isAuthLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/seller/login')
    }
  }, [isAuthLoading, isAuthenticated, router])

  if (isAuthLoading || !isAuthenticated || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SellerProductFormHeader seller={seller} title={t('products.addNew')} />
      <main className="container mx-auto px-4 py-8">
        <SellerProductForm seller={seller} mode="create" />
      </main>
    </div>
  )
}
