'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { sellerApiHeaders } from '@/hooks/use-seller-products'

type SellerLite = { email: string; brandName: string }
type ProductLite = {
  id: string
  name: string
  nameEs: string
  shippingMode?: string
  shippingGroupId?: string | null
  netContentMl?: number | null
  weightOverrideG?: number | null
}

type ShippingGroup = {
  id: string
  name: string
  carrier: 'blue_express' | 'chile_express' | 'custom'
  rate_rm?: number | null
  rate_sur?: number | null
  rate_norte?: number | null
  rate_extremo?: number | null
  rate_prioritario?: number | null
  free_shipping_threshold?: number | null
  eta_rm?: string | null
  eta_sur?: string | null
  eta_norte?: string | null
  eta_extremo?: string | null
  notes?: string | null
  products?: { id: string; name: string }[]
}

const CHILE_EXPRESS_DEFAULTS = {
  rate_rm: 7000,
  rate_sur: 9000,
  rate_norte: 10000,
  rate_extremo: 16000,
  rate_prioritario: 20000,
}

export function ShippingGroupsManager({
  seller,
  products,
}: {
  seller: SellerLite
  products: ProductLite[]
}) {
  const [groups, setGroups] = useState<ShippingGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<ShippingGroup | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  async function loadGroups() {
    setLoading(true)
    try {
      const res = await fetch('/api/seller/shipping-groups', { headers: sellerApiHeaders(seller) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error')
      setGroups(json.groups ?? [])
      setNotice(json.notice ?? null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar grupos')
      setGroups([])
      setNotice(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadGroups()
  }, [seller])

  useEffect(() => {
    setSelectedProductIds(editingGroup?.products?.map((product) => product.id) ?? [])
  }, [editingGroup])

  const productName = (product: ProductLite) => product.nameEs || product.name

  const groupedProductIds = useMemo(() => {
    const map = new Map<string, string>()
    groups.forEach((group) => {
      group.products?.forEach((product) => map.set(product.id, group.id))
    })
    return map
  }, [groups])

  const shippingWarnings = useMemo(() => {
    const missingGroup = products.filter(
      (product) => product.shippingMode === 'custom_group' && !product.shippingGroupId
    )
    const missingWeight = products.filter(
      (product) =>
        (product.shippingMode ?? 'blue_express') === 'blue_express' &&
        !product.weightOverrideG &&
        !product.netContentMl
    )

    return { missingGroup, missingWeight }
  }, [products])

  async function saveGroup() {
    if (!editingGroup?.name.trim()) {
      toast.error('Indica un nombre para el grupo')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...editingGroup,
        rate_rm: editingGroup.carrier === 'chile_express' ? CHILE_EXPRESS_DEFAULTS.rate_rm : editingGroup.rate_rm,
        rate_sur: editingGroup.carrier === 'chile_express' ? CHILE_EXPRESS_DEFAULTS.rate_sur : editingGroup.rate_sur,
        rate_norte:
          editingGroup.carrier === 'chile_express' ? CHILE_EXPRESS_DEFAULTS.rate_norte : editingGroup.rate_norte,
        rate_extremo:
          editingGroup.carrier === 'chile_express' ? CHILE_EXPRESS_DEFAULTS.rate_extremo : editingGroup.rate_extremo,
        rate_prioritario:
          editingGroup.carrier === 'chile_express'
            ? CHILE_EXPRESS_DEFAULTS.rate_prioritario
            : editingGroup.rate_prioritario,
      }

      const res = await fetch(
        editingGroup.id ? `/api/seller/shipping-groups/${editingGroup.id}` : '/api/seller/shipping-groups',
        {
          method: editingGroup.id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...sellerApiHeaders(seller),
          },
          body: JSON.stringify(payload),
        }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudo guardar el grupo')

      const groupId = editingGroup.id || json.group?.id
      if (groupId) {
        const assignRes = await fetch(`/api/seller/shipping-groups/${groupId}/products`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...sellerApiHeaders(seller),
          },
          body: JSON.stringify({ productIds: selectedProductIds }),
        })
        const assignJson = await assignRes.json()
        if (!assignRes.ok) throw new Error(assignJson.error || 'No se pudieron asignar productos')
      }

      toast.success('Grupo guardado')
      setEditingGroup(null)
      setSelectedProductIds([])
      await loadGroups()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar grupo')
    } finally {
      setSaving(false)
    }
  }

  async function deleteGroup(groupId: string) {
    try {
      const res = await fetch(`/api/seller/shipping-groups/${groupId}`, {
        method: 'DELETE',
        headers: sellerApiHeaders(seller),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudo eliminar')
      toast.success('Grupo eliminado')
      await loadGroups()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar grupo')
    }
  }

  async function applyModeToAll(mode: 'blue_express' | 'chile_express') {
    try {
      await Promise.all(
        products.map((product) =>
          fetch(`/api/seller/products/${product.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...sellerApiHeaders(seller),
            },
            body: JSON.stringify({
              shippingMode: mode,
              shippingGroupId: null,
            }),
          })
        )
      )

      if (mode === 'chile_express' && !groups.some((group) => group.name === 'Chile Express')) {
        await fetch('/api/seller/shipping-groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...sellerApiHeaders(seller),
          },
          body: JSON.stringify({
            name: 'Chile Express',
            carrier: 'chile_express',
            ...CHILE_EXPRESS_DEFAULTS,
          }),
        })
      }

      toast.success(mode === 'blue_express' ? 'Blue Express aplicado a todos los productos' : 'Chile Express aplicado a todos los productos')
      await loadGroups()
    } catch {
      toast.error('No se pudo aplicar el metodo a todos los productos')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Metodos de envio</CardTitle>
          <p className="text-sm text-muted-foreground">Configura Blue Express, Chile Express o grupos personalizados.</p>
        </div>
        <Button
          type="button"
          onClick={() =>
            setEditingGroup({
              id: '',
              name: '',
              carrier: 'custom',
              eta_rm: '1-2 dias habiles',
              eta_sur: '3-5 dias habiles',
              eta_norte: '4-6 dias habiles',
              eta_extremo: '8-12 dias habiles',
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo grupo
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {(shippingWarnings.missingGroup.length > 0 || shippingWarnings.missingWeight.length > 0) && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Hay productos con configuracion de envio incompleta.</p>
            {shippingWarnings.missingGroup.length > 0 && (
              <p className="mt-1">
                {shippingWarnings.missingGroup.length} producto(s) quedaron con grupo personalizado sin grupo asignado.
              </p>
            )}
            {shippingWarnings.missingWeight.length > 0 && (
              <p className="mt-1">
                {shippingWarnings.missingWeight.length} producto(s) usan Blue Express pero no tienen peso o contenido configurado.
              </p>
            )}
          </div>
        )}

        {notice && (
          <div className="rounded-2xl border border-sky-300 bg-sky-50 p-4 text-sm text-sky-900">
            {notice}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => void applyModeToAll('blue_express')}>
            Usar Blue Express para todos
          </Button>
          <Button type="button" variant="outline" onClick={() => void applyModeToAll('chile_express')}>
            Usar Chile Express para todos
          </Button>
        </div>

        {editingGroup && (
          <div className="rounded-2xl border border-border/60 bg-secondary/30 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nombre del grupo</Label>
                <Input value={editingGroup.name} onChange={(event) => setEditingGroup({ ...editingGroup, name: event.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Carrier</Label>
                <Select
                  value={editingGroup.carrier}
                  onValueChange={(value: 'blue_express' | 'chile_express' | 'custom') =>
                    setEditingGroup({ ...editingGroup, carrier: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue_express">Blue Express</SelectItem>
                    <SelectItem value="chile_express">Chile Express</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editingGroup.carrier === 'custom' ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(['rate_rm', 'rate_sur', 'rate_norte', 'rate_extremo', 'rate_prioritario'] as const).map((key) => (
                  <div key={key}>
                    <Label>{key.replace('rate_', '').toUpperCase()}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editingGroup[key] ?? ''}
                      onChange={(event) =>
                        setEditingGroup({
                          ...editingGroup,
                          [key]: event.target.value === '' ? null : Number(event.target.value),
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            ) : editingGroup.carrier === 'chile_express' ? (
              <div className="mt-4 rounded-xl border border-border/60 bg-background p-4 text-sm text-muted-foreground">
                RM $7.000 · Sur $9.000 · Norte $10.000 · Extremo $16.000 · Prioritario $20.000
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-border/60 bg-background p-4 text-sm text-muted-foreground">
                Este grupo usara Blue Express automatico por peso.
              </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <Label>Envio gratis desde (opcional)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingGroup.free_shipping_threshold ?? ''}
                  onChange={(event) =>
                    setEditingGroup({
                      ...editingGroup,
                      free_shipping_threshold: event.target.value === '' ? null : Number(event.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>ETA RM</Label>
                <Input
                  value={editingGroup.eta_rm ?? ''}
                  onChange={(event) => setEditingGroup({ ...editingGroup, eta_rm: event.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Notas para el cliente</Label>
              <Textarea
                value={editingGroup.notes ?? ''}
                onChange={(event) => setEditingGroup({ ...editingGroup, notes: event.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="mt-4">
              <Label>Productos del grupo</Label>
              <div className="mt-2 max-h-56 space-y-2 overflow-y-auto rounded-xl border border-border/60 bg-background p-3">
                {products.map((product) => {
                  const assignedGroupId = groupedProductIds.get(product.id)
                  const checked = selectedProductIds.includes(product.id)
                  return (
                    <label key={product.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/40 px-3 py-2">
                      <span className="text-sm">{productName(product)}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {assignedGroupId && assignedGroupId !== editingGroup.id && <span>En otro grupo</span>}
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setSelectedProductIds((current) =>
                              event.target.checked
                                ? [...current, product.id]
                                : current.filter((id) => id !== product.id)
                            )
                          }
                        />
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button type="button" onClick={() => void saveGroup()} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar grupo'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando grupos...</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavia no creas grupos personalizados.</p>
        ) : (
          <div className="grid gap-4">
            {groups.map((group) => (
              <div key={group.id} className="rounded-2xl border border-border/60 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">Carrier: {group.carrier}</p>
                    <p className="text-sm text-muted-foreground">
                      RM: ${Number(group.rate_rm ?? 0).toLocaleString('es-CL')} · Sur: ${Number(group.rate_sur ?? 0).toLocaleString('es-CL')} · Norte: ${Number(group.rate_norte ?? 0).toLocaleString('es-CL')}
                    </p>
                    <p className="text-sm text-muted-foreground">{group.products?.length ?? 0} productos asignados</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditingGroup(group)}>
                      Editar
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => void deleteGroup(group.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
