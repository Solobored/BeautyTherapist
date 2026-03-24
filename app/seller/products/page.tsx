'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Store, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { products } from '@/lib/data'

export default function SellerProductsPage() {
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
              <Button asChild variant="ghost" size="sm">
                <Link href="/seller/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/brands/${seller.brandName.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Store className="h-4 w-4 mr-2" />
                  {t('dashboard.viewStore')}
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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              {t('products.title')}
            </h1>
            <p className="text-muted-foreground mt-1">{products.length} products</p>
          </div>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/seller/products/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('products.addNew')}
            </Link>
          </Button>
        </div>
        
        {/* Products Table */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>{t('products.name')}</TableHead>
                <TableHead>{t('products.category')}</TableHead>
                <TableHead>{t('products.price')}</TableHead>
                <TableHead>{t('products.stock')}</TableHead>
                <TableHead>{t('products.status')}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={product.images[0]}
                        alt={language === 'es' ? product.nameEs : product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{language === 'es' ? product.nameEs : product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">${product.price.toFixed(2)}</span>
                      {product.comparePrice && (
                        <span className="text-xs text-muted-foreground line-through ml-2">
                          ${product.comparePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={product.stock < 10 ? 'text-amber-600 font-medium' : ''}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={product.status === 'active'} />
                      <span className="text-sm text-muted-foreground capitalize">{product.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/seller/products/${product.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
