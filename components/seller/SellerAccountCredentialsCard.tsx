'use client'

import { useState } from 'react'
import { Lock, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SellerAccountCredentialsCard() {
  const { seller, changeSellerCredentials } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const trimmedCurrentPassword = currentPassword.trim()
    const trimmedNewEmail = newEmail.trim()
    const trimmedNewPassword = newPassword.trim()
    const trimmedConfirmPassword = confirmPassword.trim()

    if (!trimmedCurrentPassword) {
      setErrorMessage('Ingresa tu contraseña actual para confirmar el cambio.')
      return
    }

    if (!trimmedNewEmail && !trimmedNewPassword) {
      setErrorMessage('Completa un nuevo correo o una nueva contraseña.')
      return
    }

    if (trimmedNewPassword && trimmedNewPassword !== trimmedConfirmPassword) {
      setErrorMessage('La confirmación de la nueva contraseña no coincide.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await changeSellerCredentials({
        currentPassword: trimmedCurrentPassword,
        newEmail: trimmedNewEmail || undefined,
        newPassword: trimmedNewPassword || undefined,
      })

      if (!result.success) {
        setErrorMessage(result.message)
        return
      }

      setSuccessMessage(result.message)
      setCurrentPassword('')
      setNewEmail('')
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Seguridad de la cuenta
        </CardTitle>
        <CardDescription>
          Tu marca, productos y pedidos siguen ligados a la misma cuenta. Aquí solo cambias tus datos de acceso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="seller-current-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correo actual
            </Label>
            <Input
              id="seller-current-email"
              value={seller?.email ?? ''}
              disabled
              className="bg-muted/40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seller-new-email">Nuevo correo</Label>
              <Input
                id="seller-new-email"
                type="email"
                placeholder="nuevo-correo@ejemplo.com"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller-current-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Contraseña actual
              </Label>
              <Input
                id="seller-current-password"
                type="password"
                placeholder="Tu contraseña actual"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seller-new-password">Nueva contraseña</Label>
              <Input
                id="seller-new-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller-confirm-password">Confirmar nueva contraseña</Label>
              <Input
                id="seller-confirm-password"
                type="password"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Si cambias el correo, tu sesión seguirá vinculada a la misma cuenta de vendedor y podrás entrar con el nuevo email.
          </p>

          <Button
            type="submit"
            disabled={isSubmitting || !seller}
            className="w-full md:w-auto"
          >
            {isSubmitting ? 'Guardando cambios...' : 'Actualizar acceso'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
