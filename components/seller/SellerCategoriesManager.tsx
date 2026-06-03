'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sellerApiHeaders } from '@/hooks/use-seller-products'

type SellerLite = { email: string; brandName: string }
type SellerCategory = { id: string; name: string; slug: string }
type ProductLite = { category: string }

const defaultCategories = [
  { name: 'Skincare', slug: 'skincare' },
  { name: 'Makeup', slug: 'makeup' },
]

export function SellerCategoriesManager({
  seller,
  products,
}: {
  seller: SellerLite
  products: ProductLite[]
}) {
  const [categories, setCategories] = useState<SellerCategory[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadCategories() {
    setLoading(true)
    try {
      const res = await fetch('/api/seller/categories', { headers: sellerApiHeaders(seller) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al cargar categorías')
      setCategories(json.categories ?? [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar categorías')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [seller])

  const usage = useMemo(() => {
    const counts = new Map<string, number>()
    products.forEach((product) => {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1)
    })
    return counts
  }, [products])

  async function createCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error('Escribe un nombre de categoría')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/seller/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...sellerApiHeaders(seller) },
        body: JSON.stringify({ name }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudo crear la categoría')
      setName('')
      toast.success('Categoría creada')
      await loadCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear categoría')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCategory(category: SellerCategory) {
    if ((usage.get(category.slug) ?? 0) > 0) {
      toast.error('No elimines categorías que tienen productos asignados')
      return
    }

    setDeletingId(category.id)
    try {
      const res = await fetch(`/api/seller/categories/${category.id}`, {
        method: 'DELETE',
        headers: sellerApiHeaders(seller),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudo eliminar')
      toast.success('Categoría eliminada')
      await loadCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar categoría')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Crear categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createCategory} className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nombre</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Cuidado capilar"
                maxLength={60}
                className="mt-1"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Úsala para ordenar tu catálogo por líneas, tratamientos o tipo de producto.
              </p>
            </div>
            <Button type="submit" disabled={saving}>
              <Plus className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Agregar categoría'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categorías disponibles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {defaultCategories.map((category) => (
            <div key={category.slug} className="flex items-center justify-between rounded-xl border border-border/60 p-4">
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">Categoría base · {usage.get(category.slug) ?? 0} productos</p>
              </div>
              <Badge variant="secondary">Base</Badge>
            </div>
          ))}

          {loading ? (
            <p className="py-4 text-sm text-muted-foreground">Cargando categorías...</p>
          ) : categories.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Aún no tienes categorías personalizadas.
            </p>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{usage.get(category.slug) ?? 0} productos</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={deletingId === category.id}
                  onClick={() => void deleteCategory(category)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
