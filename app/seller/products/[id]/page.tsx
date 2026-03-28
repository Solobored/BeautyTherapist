'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { SellerProductForm, SellerProductFormHeader } from '@/components/seller/seller-product-form'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t } = useLanguage()
  const { seller, isAuthenticated } = useAuth()
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

  return (
    <div className="min-h-screen bg-background">
      <SellerProductFormHeader seller={seller} title="Editar producto" />
      <main className="container mx-auto px-4 py-8">
        <SellerProductForm seller={seller} mode="edit" productId={id} />
      </main>
    </div>
  )
}
