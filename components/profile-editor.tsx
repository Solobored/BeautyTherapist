'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ProfileEditorProps {
  fullName: string
  profilePhoto?: string
  backgroundPhoto?: string
  description?: string
  onSave?: (data: {
    profilePhoto?: string
    backgroundPhoto?: string
    description?: string
  }) => Promise<void>
  isLoading?: boolean
}

export function ProfileEditor({
  fullName,
  profilePhoto,
  backgroundPhoto,
  description,
  onSave,
  isLoading
}: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    profilePhoto: profilePhoto || '',
    backgroundPhoto: backgroundPhoto || '',
    description: description || ''
  })
  const [previewProfilePhoto, setPreviewProfilePhoto] = useState<string | null>(null)
  const [previewBackgroundPhoto, setPreviewBackgroundPhoto] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewProfilePhoto(result)
        setFormData({ ...formData, profilePhoto: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackgroundPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewBackgroundPhoto(result)
        setFormData({ ...formData, backgroundPhoto: result })
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
          profilePhoto: formData.profilePhoto || undefined,
          backgroundPhoto: formData.backgroundPhoto || undefined,
          description: formData.description || undefined
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentProfilePhoto = previewProfilePhoto || profilePhoto
  const currentBackgroundPhoto = previewBackgroundPhoto || backgroundPhoto

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Background Photo */}
        <div className="space-y-3">
          <Label>Foto de Fondo</Label>
          <div className="relative h-32 rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border">
            {currentBackgroundPhoto ? (
              <Image
                src={currentBackgroundPhoto}
                alt="Background"
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            )}
            <label className="absolute top-2 right-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundPhotoChange}
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
        </div>

        {/* Profile Photo */}
        <div className="space-y-3">
          <Label>Foto de Perfil</Label>
          <div className="flex items-end gap-4">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted border-4 border-primary shrink-0">
              {currentProfilePhoto ? (
                <Image
                  src={currentProfilePhoto}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                  <span className="text-2xl font-semibold text-primary">
                    {fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
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
                  Cambiar Foto
                </div>
              </Button>
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label>Descripción</Label>
          <Textarea
            placeholder="Cuéntanos sobre ti..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Máximo 500 caracteres
            ({formData.description.length}/500)
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
              <Camera className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
