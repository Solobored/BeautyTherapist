'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { SellerBlogPostForm } from '@/components/seller/SellerBlogPostForm'

export default function SellerBlogNewPage() {
  const { t } = useLanguage()
  const { seller, isAuthenticated, isAuthLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.push('/seller/login')
  }, [isAuthLoading, isAuthenticated, router])

  if (isAuthLoading || !isAuthenticated || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    )
  }

  return <SellerBlogPostForm seller={seller} mode="create" />
}
