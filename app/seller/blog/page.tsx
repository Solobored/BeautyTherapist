'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, ArrowLeft, LayoutDashboard, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { sellerApiHeaders } from '@/hooks/use-seller-products'

type Post = {
  id: string
  title_es: string
  slug: string
  category: string | null
  published_at: string | null
  created_at: string
}

export default function SellerBlogListPage() {
  const { t } = useLanguage()
  const { seller, isAuthenticated, isAuthLoading, logout } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.push('/seller/login')
  }, [isAuthLoading, isAuthenticated, router])

  useEffect(() => {
    if (!seller?.email) return
    let c = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/seller/blog', { headers: sellerApiHeaders(seller) })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        if (!c) {
          setPosts(json.posts ?? [])
          if (json.notice) setNotice(json.notice)
        }
      } catch {
        if (!c) setPosts([])
      } finally {
        if (!c) setLoading(false)
      }
    })()
    return () => {
      c = true
    }
  }, [seller])

  if (isAuthLoading || !isAuthenticated || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/seller/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <span className="font-serif text-xl font-semibold">Blog de marca</span>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/seller/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-accent text-accent-foreground">
                <Link href="/seller/blog/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo post
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { void logout() }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-2xl font-semibold mb-2">Entradas</h1>
        <p className="text-muted-foreground mb-6">
          Tips, ofertas y tutoriales para tus clientes (se publican en el blog cuando la integración esté activa).
        </p>
        {notice && <p className="text-sm text-amber-700 mb-4">{notice}</p>}

        {loading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No hay entradas aún. Crea la primera.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.id}>
                <Card>
                  <CardContent className="py-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{p.title_es}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.slug}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {p.published_at
                        ? new Date(p.published_at).toLocaleDateString('es-CL')
                        : '—'}
                    </span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
