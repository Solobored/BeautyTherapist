'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Store, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { useSellerProducts, sellerApiHeaders } from '@/hooks/use-seller-products'
import { brandNameToSlug } from '@/lib/seller-utils'
import { formatClp } from '@/lib/utils'
import { toast } from 'sonner'

export default function SellerProductsPage() {
  const { t } = useLanguage()
  const { seller, isAuthenticated, isAuthLoading, logout } = useAuth()
  const { products, loading, error, refresh } = useSellerProducts()
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [statusBusy, setStatusBusy] = useState<string | null>(null)

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

  const handleLogout = async () => {
    await logout()
  }

  const storeSlug = brandNameToSlug(seller.brandName)

  const handleStatusChange = async (productId: string, checked: boolean) => {
    setStatusBusy(productId)
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...sellerApiHeaders(seller) },
        body: JSON.stringify({ status: checked ? 'active' : 'draft' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error')
      toast.success('Estado actualizado')
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setStatusBusy(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/seller/products/${deleteId}`, {
        method: 'DELETE',
        headers: sellerApiHeaders(seller),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error')
      toast.success('Producto eliminado')
      setDeleteId(null)
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/seller/dashboard" className="font-serif text-xl font-semibold">
              Beauty & Therapy
            </Link>

            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/seller/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/brands/${storeSlug}`}>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">{t('products.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {loading ? '…' : `${products.length} productos`}
            </p>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </div>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/seller/products/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('products.addNew')}
            </Link>
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-muted-foreground">{t('common.loading')}</p>
          ) : products.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              No hay productos aún. Crea uno nuevo o verifica tu conexión a Supabase.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>{t('products.category')}</TableHead>
                  <TableHead>Precio (CLP)</TableHead>
                  <TableHead>{t('products.stock')}</TableHead>
                  <TableHead>{t('products.status')}</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={product.images[0] || '/placeholder.svg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
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
                        <span className="font-medium">{formatClp(product.price)}</span>
                        {product.comparePrice != null && product.comparePrice > 0 && (
                          <span className="text-xs text-muted-foreground line-through ml-2">
                            {formatClp(product.comparePrice)}
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
                        <Switch
                          checked={product.status === 'active'}
                          disabled={statusBusy === product.id}
                          onCheckedChange={(checked) => handleStatusChange(product.id, checked)}
                        />
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también las imágenes asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
