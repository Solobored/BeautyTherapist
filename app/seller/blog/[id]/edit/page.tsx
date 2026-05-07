'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { sellerApiHeaders } from '@/hooks/use-seller-products'
import { SellerBlogPostForm } from '@/components/seller/SellerBlogPostForm'

type EditPost = {
  title: string
  content: string
  category: string
  images: { url: string; publicId: string; position: number }[]
  products: { id: string; name: string; imageUrl: string; price: number; slug: string }[]
}

export default function SellerBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { seller, isAuthenticated, isAuthLoading } = useAuth()
  const [post, setPost] = useState<EditPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.push('/seller/login')
  }, [isAuthLoading, isAuthenticated, router])

  useEffect(() => {
    if (!seller?.email) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/seller/blog/${id}`, {
          headers: sellerApiHeaders(seller),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Error al cargar post')
        if (!cancelled) {
          setPost({
            title: json.post.title,
            content: json.post.content,
            category: json.post.category,
            images: json.post.images ?? [],
            products: json.post.products ?? [],
          })
        }
      } catch {
        if (!cancelled) setPost(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [id, seller])

  if (isAuthLoading || !isAuthenticated || !seller || loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>
  }

  return <SellerBlogPostForm seller={seller} mode="edit" postId={id} initialPost={post} />
}
