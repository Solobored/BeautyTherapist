'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, CreditCard, ExternalLink, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type MpStatus = {
  connected: boolean
  mpUserId: string | null
  liveMode: boolean | null
  connectedAt: string | null
  expiresAt: string | null
}

const CONNECT_ERROR_MESSAGES: Record<string, string> = {
  authorization_denied: 'Cancelaste la autorización en Mercado Pago. Puedes intentarlo de nuevo cuando quieras.',
  missing_code_or_state: 'La conexión no se completó correctamente. Intenta de nuevo.',
  invalid_state: 'No pudimos validar la solicitud de conexión. Intenta de nuevo.',
  token_exchange_failed: 'Mercado Pago no pudo confirmar la conexión. Intenta de nuevo en unos minutos.',
}

export function SellerMercadoPagoConnectCard() {
  const [status, setStatus] = useState<MpStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const loadStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    try {
      const res = await fetch('/api/seller/mercadopago/status')
      if (!res.ok) throw new Error('status_fetch_failed')
      setStatus((await res.json()) as MpStatus)
    } catch (e) {
      console.error(e)
      setStatus(null)
    } finally {
      setIsLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  useEffect(() => {
    const result = searchParams.get('mp_connect')
    if (!result) return

    if (result === 'ok') {
      setBanner({ type: 'success', text: '¡Tu cuenta de Mercado Pago quedó conectada! Ya puedes recibir pagos.' })
      loadStatus()
    } else {
      const msgKey = searchParams.get('mp_connect_msg') ?? ''
      setBanner({
        type: 'error',
        text: CONNECT_ERROR_MESSAGES[msgKey] ?? 'No pudimos conectar tu cuenta de Mercado Pago. Intenta de nuevo.',
      })
    }

    router.replace(pathname)
  }, [searchParams, router, pathname, loadStatus])

  const handleDisconnect = async () => {
    const confirmed = window.confirm(
      '¿Seguro que quieres desconectar tu cuenta de Mercado Pago? No podrás recibir pagos hasta que la conectes de nuevo.'
    )
    if (!confirmed) return

    setIsDisconnecting(true)
    try {
      const res = await fetch('/api/seller/mercadopago/disconnect', { method: 'POST' })
      if (!res.ok) throw new Error('disconnect_failed')
      await loadStatus()
      setBanner({ type: 'success', text: 'Desconectaste tu cuenta de Mercado Pago.' })
    } catch (e) {
      console.error(e)
      setBanner({ type: 'error', text: 'No se pudo desconectar. Intenta de nuevo.' })
    } finally {
      setIsDisconnecting(false)
    }
  }

  const connected = status?.connected ?? false

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Cobros con Mercado Pago
        </CardTitle>
        <CardDescription>
          Conecta tu propia cuenta de Mercado Pago para recibir directamente el pago de tus ventas. No compartes
          contraseñas ni tokens: solo inicias sesión en tu cuenta y autorizas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {banner && (
          <div
            className={
              banner.type === 'success'
                ? 'rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'
                : 'rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'
            }
          >
            {banner.text}
          </div>
        )}

        {isLoadingStatus ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Consultando estado de tu cuenta...
          </div>
        ) : connected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Cuenta conectada{status?.mpUserId ? ` · ID de vendedor ${status.mpUserId}` : ''}
            </div>
            {status?.connectedAt && (
              <p className="text-xs text-muted-foreground">
                Conectada el {new Date(status.connectedAt).toLocaleDateString('es-CL')}
              </p>
            )}
            <Button type="button" variant="outline" onClick={handleDisconnect} disabled={isDisconnecting}>
              {isDisconnecting ? 'Desconectando...' : 'Desconectar cuenta'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4" />
              Todavía no conectaste tu cuenta de Mercado Pago. No podrás recibir pagos hasta hacerlo.
            </div>
            <Button asChild>
              <a href="/api/seller/mercadopago/connect" className="inline-flex items-center gap-2">
                Conectar cuenta con Mercado Pago
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
