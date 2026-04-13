'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LayoutDashboard, LogOut, Package, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { sellerApiHeaders } from '@/hooks/use-seller-products'
import { formatClp } from '@/lib/utils'
import { toast } from 'sonner'

type SellerOrder = {
  id: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string | null
  shippingAddress: Record<string, string> | null
  items: { productId?: string; name: string; quantity: number; price: number }[]
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  orderStatus: string
  paymentStatus: string
  createdAt: string
}

const statusClass: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900',
  processing: 'bg-blue-100 text-blue-900',
  shipped: 'bg-indigo-100 text-indigo-900',
  delivered: 'bg-green-100 text-green-900',
  cancelled: 'bg-muted text-muted-foreground',
}

export default function SellerOrdersPage() {
  const { t } = useLanguage()
  const { seller, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<SellerOrder | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelBusy, setCancelBusy] = useState(false)
  const [shipBusyId, setShipBusyId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SellerOrder | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/seller/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!seller?.email) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/seller/orders', {
          headers: sellerApiHeaders(seller),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Error')
        if (!cancelled) setOrders(json.orders ?? [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [seller])

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

  const submitCancelOrder = async () => {
    if (!seller || !cancelTarget) return
    setCancelBusy(true)
    try {
      const res = await fetch(`/api/seller/orders/${cancelTarget.id}/cancel`, {
        method: 'POST',
        headers: {
          ...sellerApiHeaders(seller),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: cancelReason }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'No se pudo anular el pedido')
      toast.success(
        json.refunded
          ? 'Pedido anulado. Se solicitó reembolso en Mercado Pago y se avisó al comprador por correo.'
          : 'Pedido anulado. Se notificó al comprador por correo.'
      )
      setOrders((prev) => prev.filter((o) => o.id !== cancelTarget.id))
      setCancelTarget(null)
      setCancelReason('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setCancelBusy(false)
    }
  }

  const markAsShipped = async (order: SellerOrder) => {
    if (!seller) return
    setShipBusyId(order.id)
    try {
      const res = await fetch(`/api/seller/orders/${order.id}/ship`, {
        method: 'POST',
        headers: sellerApiHeaders(seller),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'No se pudo marcar como enviado')
      toast.success('Pedido marcado como enviado. Se notificó al comprador por email.')
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, orderStatus: 'shipped' } : o))
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setShipBusyId(null)
    }
  }

  const submitDeleteOrder = async () => {
    if (!seller || !deleteTarget) return
    setDeleteBusy(true)
    try {
      const res = await fetch(`/api/seller/orders/${deleteTarget.id}/delete`, {
        method: 'POST',
        headers: sellerApiHeaders(seller),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'No se pudo borrar el pedido')
      toast.success('Pedido eliminado correctamente.')
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setDeleteBusy(false)
    }
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
              <Link href="/seller/dashboard" className="font-serif text-xl font-semibold">
                Beauty & Therapy
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/seller/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
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
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold">Pedidos</h1>
          <p className="text-muted-foreground mt-1">
            Envíos y datos de compradores para tus productos.
          </p>
        </div>

        {error && <p className="text-destructive mb-4">{error}</p>}

        {loading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aún no hay pedidos con productos de tu marca.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-mono">{order.id.slice(0, 8)}…</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={statusClass[order.orderStatus] ?? 'bg-secondary'}>
                      {order.orderStatus}
                    </Badge>
                    <Badge variant="outline">{order.paymentStatus}</Badge>
                    {order.orderStatus !== 'cancelled' &&
                      order.orderStatus !== 'shipped' &&
                      order.orderStatus !== 'delivered' && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => markAsShipped(order)}
                          disabled={shipBusyId === order.id}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {shipBusyId === order.id ? 'Marcando…' : 'Producto enviado'}
                        </Button>
                      )}
                    {order.orderStatus !== 'cancelled' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => {
                          setCancelTarget(order)
                          setCancelReason('')
                        }}
                      >
                        Anular pedido
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600/40 hover:bg-red-600/10"
                      onClick={() => setDeleteTarget(order)}
                      disabled={deleteBusy}
                    >
                      🗑️ Borrar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Comprador</h3>
                      <p className="text-sm">{order.buyerName}</p>
                      <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
                      {order.buyerPhone && (
                        <p className="text-sm text-muted-foreground">{order.buyerPhone}</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Envío</h3>
                      {order.shippingAddress && (
                        <div className="text-sm space-y-1">
                          {(order.shippingAddress as Record<string, string>).full_name && (
                            <p>{(order.shippingAddress as Record<string, string>).full_name}</p>
                          )}
                          <p>{order.shippingAddress.street}</p>
                          <p>
                            {[
                              order.shippingAddress.city,
                              order.shippingAddress.state,
                              order.shippingAddress.zip,
                              order.shippingAddress.country,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                          {/* Mostrar geolocalización si está disponible */}
                          {(order.shippingAddress as Record<string, any>).lat && (order.shippingAddress as Record<string, any>).lng && (
                            <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
                              <p className="text-xs text-muted-foreground">
                                📍 Ubicación exacta
                              </p>
                              <p className="font-mono text-xs">
                                {(order.shippingAddress as Record<string, any>).lat.toFixed(4)}, {(order.shippingAddress as Record<string, any>).lng.toFixed(4)}
                              </p>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="mt-1"
                              >
                                <a
                                  href={`https://www.google.com/maps/?q=${(order.shippingAddress as Record<string, any>).lat},${(order.shippingAddress as Record<string, any>).lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs"
                                >
                                  Ver en Google Maps →
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Productos de tu marca en este pedido</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-right">Cant.</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, i) => (
                          <TableRow key={`${order.id}-${i}`}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatClp(item.price)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex flex-wrap justify-end gap-6 text-sm border-t pt-4">
                    <span>
                      Subtotal: <strong>{formatClp(order.subtotal)}</strong>
                    </span>
                    <span>
                      Envío: <strong>{formatClp(order.shippingCost)}</strong>
                    </span>
                    <span>
                      Descuento: <strong>{formatClp(order.discount)}</strong>
                    </span>
                    <span className="text-base">
                      Total: <strong>{formatClp(order.total)}</strong>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={cancelTarget != null} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anular pedido</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                <p>
                  Si el pago ya fue aprobado en Mercado Pago, se solicitará un{' '}
                  <strong>reembolso automático</strong> y se devolverá stock de los productos de tu marca. El comprador
                  recibirá un correo en <strong>{cancelTarget?.buyerEmail}</strong>.
                </p>
                <div className="space-y-1">
                  <Label htmlFor="cancel-reason">Motivo (opcional)</Label>
                  <Textarea
                    id="cancel-reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ej: producto agotado, dirección no cubierta..."
                    rows={3}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelBusy}>Volver</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelBusy}
              onClick={(e) => {
                e.preventDefault()
                void submitCancelOrder()
              }}
            >
              {cancelBusy ? 'Procesando…' : 'Confirmar anulación'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Order Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de borrar este pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El pedido será eliminado permanentemente de tu dashboard.
              {deleteTarget && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">ID: {deleteTarget.id.slice(0, 8)}…</p>
                  <p className="text-sm">Cliente: {deleteTarget.buyerName}</p>
                  <p className="text-sm">Total: ${deleteTarget.total}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteBusy}
              onClick={(e) => {
                e.preventDefault()
                void submitDeleteOrder()
              }}
            >
              {deleteBusy ? 'Borrando…' : 'Sí, borrar pedido'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
