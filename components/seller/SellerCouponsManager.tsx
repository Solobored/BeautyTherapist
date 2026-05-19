'use client'

import { useEffect, useState } from 'react'
import { Ticket, Truck, Percent, BadgeDollarSign } from 'lucide-react'
import { sellerApiHeaders } from '@/hooks/use-seller-products'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatClp } from '@/lib/utils'

type SellerLike = {
  email: string
  brandName: string
}

type SellerCoupon = {
  id: string
  code: string
  title: string
  description: string | null
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  minOrder: number | null
  maxUses: number | null
  usedCount: number
  reservedCount: number
  perUserLimit: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

type CouponFormState = {
  title: string
  code: string
  description: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: string
  maxUses: string
  minOrder: string
  expiresAt: string
}

const initialForm: CouponFormState = {
  title: '',
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  maxUses: '',
  minOrder: '',
  expiresAt: '',
}

function benefitLabel(coupon: SellerCoupon) {
  if (coupon.type === 'free_shipping') return 'Envío gratis'
  if (coupon.type === 'percentage') return `${coupon.value}% de descuento`
  return `${formatClp(coupon.value)} de descuento`
}

function benefitIcon(type: SellerCoupon['type']) {
  if (type === 'free_shipping') return Truck
  if (type === 'percentage') return Percent
  return BadgeDollarSign
}

export function SellerCouponsManager({ seller }: { seller: SellerLike }) {
  const [coupons, setCoupons] = useState<SellerCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [form, setForm] = useState<CouponFormState>(initialForm)

  const loadCoupons = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/seller/coupons', {
        headers: sellerApiHeaders(seller),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'No se pudieron cargar los cupones.')
      setCoupons(Array.isArray(json.coupons) ? json.coupons : [])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al cargar cupones.')
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCoupons()
  }, [])

  const handleCreateCoupon = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    setStatusMessage(null)

    try {
      const payload = {
        title: form.title.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        type: form.type,
        value: form.type === 'free_shipping' ? 0 : Number(form.value || 0),
        maxUses: form.maxUses.trim() ? Number(form.maxUses) : null,
        minOrder: form.minOrder.trim() ? Number(form.minOrder) : null,
        expiresAt: form.expiresAt || null,
      }

      const res = await fetch('/api/seller/coupons', {
        method: 'POST',
        headers: {
          ...sellerApiHeaders(seller),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'No se pudo crear el cupón.')

      setForm(initialForm)
      setStatusMessage('Cupón creado correctamente.')
      await loadCoupons()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear el cupón.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleCoupon = async (coupon: SellerCoupon) => {
    setErrorMessage(null)
    setStatusMessage(null)

    try {
      const res = await fetch(`/api/seller/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: {
          ...sellerApiHeaders(seller),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'No se pudo actualizar el cupón.')

      setCoupons((current) =>
        current.map((item) =>
          item.id === coupon.id
            ? {
                ...item,
                isActive: !coupon.isActive,
              }
            : item
        )
      )
      setStatusMessage(!coupon.isActive ? 'Cupón activado.' : 'Cupón pausado.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar el cupón.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Crear cupón de vendedor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Como en marketplaces grandes: defines un código, una cantidad total de usos y el sistema bloquea que el mismo cliente use ese cupón más de una vez.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {statusMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {statusMessage}
            </div>
          )}
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="coupon-title">Nombre interno</Label>
              <Input
                id="coupon-title"
                placeholder="Ej: Bienvenida mayo"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="coupon-code">Código</Label>
              <Input
                id="coupon-code"
                placeholder="Ej: BELLA10"
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({ ...current, code: event.target.value.toUpperCase().replace(/\s+/g, '') }))
                }
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="coupon-description">Descripción opcional</Label>
            <Input
              id="coupon-description"
              placeholder="Ej: Cupón de bienvenida para nuevos clientes"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Beneficio</Label>
              <Select
                value={form.type}
                onValueChange={(value: CouponFormState['type']) => setForm((current) => ({ ...current, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona beneficio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Descuento %</SelectItem>
                  <SelectItem value="fixed">Descuento fijo</SelectItem>
                  <SelectItem value="free_shipping">Envío gratis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="coupon-value">
                {form.type === 'percentage' ? 'Porcentaje' : form.type === 'fixed' ? 'Monto' : 'Valor'}
              </Label>
              <Input
                id="coupon-value"
                type="number"
                min="0"
                placeholder={form.type === 'percentage' ? '10' : '5000'}
                value={form.type === 'free_shipping' ? '' : form.value}
                disabled={form.type === 'free_shipping'}
                onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="coupon-max-uses">Cantidad total de usos</Label>
              <Input
                id="coupon-max-uses"
                type="number"
                min="1"
                placeholder="100"
                value={form.maxUses}
                onChange={(event) => setForm((current) => ({ ...current, maxUses: event.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="coupon-min-order">Compra mínima</Label>
              <Input
                id="coupon-min-order"
                type="number"
                min="0"
                placeholder="0"
                value={form.minOrder}
                onChange={(event) => setForm((current) => ({ ...current, minOrder: event.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="coupon-expiry">Vencimiento</Label>
              <Input
                id="coupon-expiry"
                type="date"
                value={form.expiresAt}
                onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
              />
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Regla aplicada automáticamente: `1 uso por cliente` para cada cupón, usando el correo del comprador para impedir reutilización.
            </div>
          </div>

          <Button onClick={handleCreateCoupon} disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear cupón'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cupones creados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando cupones...</p>
          ) : coupons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              Todavía no has creado cupones. Cuando agregues uno aparecerá aquí con su estado y sus usos.
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => {
                const Icon = benefitIcon(coupon.type)
                const totalConsumed = coupon.usedCount + coupon.reservedCount

                return (
                  <div key={coupon.id} className="rounded-2xl border border-border/60 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-base font-semibold">{coupon.code}</span>
                          <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                            {coupon.isActive ? 'Activo' : 'Pausado'}
                          </Badge>
                          <Badge variant="outline">1 uso por cliente</Badge>
                        </div>
                        <p className="font-medium text-foreground">{coupon.title}</p>
                        {coupon.description && (
                          <p className="text-sm text-muted-foreground">{coupon.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Icon className="h-4 w-4" />
                            {benefitLabel(coupon)}
                          </span>
                          <span>Usados: {coupon.usedCount}</span>
                          <span>Reservados: {coupon.reservedCount}</span>
                          <span>
                            Disponibles:{' '}
                            {coupon.maxUses == null ? 'Ilimitados' : Math.max(0, coupon.maxUses - totalConsumed)}
                          </span>
                          {coupon.minOrder != null && <span>Mínimo: {formatClp(coupon.minOrder)}</span>}
                          <span>
                            Vence:{' '}
                            {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Sin vencimiento'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant={coupon.isActive ? 'outline' : 'default'} onClick={() => handleToggleCoupon(coupon)}>
                          {coupon.isActive ? 'Pausar' : 'Activar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
