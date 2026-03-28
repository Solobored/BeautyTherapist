'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SellerProfileEditorProps {
  brandName: string
  brandLogo?: string
  brandBanner?: string
  brandDescription?: string
  onSave?: (data: {
    brandLogo?: string
    brandBanner?: string
    brandDescription?: string
  }) => Promise<void>
  isLoading?: boolean
}

export function SellerProfileEditor({
  brandName,
  brandLogo,
  brandBanner,
  brandDescription,
  onSave,
  isLoading
}: SellerProfileEditorProps) {
  const [formData, setFormData] = useState({
    brandLogo: brandLogo || '',
    brandBanner: brandBanner || '',
    brandDescription: brandDescription || ''
  })
  const [previewLogo, setPreviewLogo] = useState<string | null>(null)
  const [previewBanner, setPreviewBanner] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewLogo(result)
        setFormData({ ...formData, brandLogo: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewBanner(result)
        setFormData({ ...formData, brandBanner: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (onSave) {
        await onSave({
          brandLogo: formData.brandLogo || undefined,
          brandBanner: formData.brandBanner || undefined,
          brandDescription: formData.brandDescription || undefined
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentLogo = previewLogo || brandLogo
  const currentBanner = previewBanner || brandBanner

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Marca</CardTitle>
        <CardDescription>
          Personaliza la apariencia de tu tienda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Brand Banner */}
        <div className="space-y-3">
          <Label>Banner de Marca</Label>
          <div className="relative h-40 rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border">
            {currentBanner ? (
              <Image
                src={currentBanner}
                alt="Banner"
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                <div className="text-center">
                  <Camera className="h-8 w-8 text-muted-foreground opacity-50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Sube un banner
                  </p>
                </div>
              </div>
            )}
            <label className="absolute top-2 right-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                asChild
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  Cambiar
                </div>
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Recomendado: 1200x400 píxeles
          </p>
        </div>

        {/* Brand Logo */}
        <div className="space-y-3">
          <Label>Logo de Marca</Label>
          <div className="flex items-end gap-4">
            <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted border-4 border-primary shrink-0">
              {currentLogo ? (
                <Image
                  src={currentLogo}
                  alt={brandName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                  <Camera className="h-8 w-8 text-primary opacity-50" />
                </div>
              )}
            </div>
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                asChild
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Cambiar Logo
                </div>
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Recomendado: 200x200 píxeles
          </p>
        </div>

        {/* Brand Description */}
        <div className="space-y-3">
          <Label>Descripción de la Marca</Label>
          <Textarea
            placeholder="Cuéntale a tus clientes sobre tu marca..."
            value={formData.brandDescription}
            onChange={(e) => setFormData({ ...formData, brandDescription: e.target.value })}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Máximo 500 caracteres
            ({formData.brandDescription.length}/500)
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="w-full"
        >
          {isSubmitting || isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
