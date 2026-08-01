'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const RIGHTS = [
  { value: 'acceso', label: 'Acceso a mis datos' },
  { value: 'rectificacion', label: 'Rectificación de datos incorrectos' },
  { value: 'cancelacion', label: 'Cancelación / eliminación de mis datos' },
  { value: 'oposicion', label: 'Oposición al tratamiento' },
  { value: 'portabilidad', label: 'Portabilidad de mis datos' },
  { value: 'bloqueo', label: 'Bloqueo temporal de mis datos' },
]

export default function DataRightsRequestPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [rightType, setRightType] = useState('')
  const [details, setDetails] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName || !email || !rightType) {
      toast.error('Completa nombre, correo y el derecho que deseas ejercer.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/data-rights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, rightType, details }),
      })

      if (!res.ok) {
        throw new Error('request_failed')
      }

      setSubmitted(true)
    } catch {
      toast.error('No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos directamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <h1 className="font-serif text-3xl mb-4">Solicitud recibida</h1>
        <p className="text-muted-foreground">
          Revisaremos tu solicitud y te responderemos al correo indicado dentro del plazo establecido por la Ley 21.719.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <h1 className="font-serif text-3xl mb-2">Ejercicio de derechos ARCO+</h1>
      <p className="text-muted-foreground mb-8">
        Usa este formulario para solicitar acceso, rectificación, cancelación, oposición, portabilidad o
        bloqueo de tus datos personales, conforme a la Ley 21.719.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo asociado a tu cuenta</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rightType">Derecho que deseas ejercer</Label>
          <Select value={rightType} onValueChange={setRightType}>
            <SelectTrigger id="rightType">
              <SelectValue placeholder="Selecciona un derecho" />
            </SelectTrigger>
            <SelectContent>
              {RIGHTS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="details">Detalle de tu solicitud (opcional)</Label>
          <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} rows={4} />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Enviando...' : 'Enviar solicitud'}
        </Button>
      </form>
    </div>
  )
}
