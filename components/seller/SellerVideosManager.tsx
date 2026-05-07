'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { sellerApiHeaders } from '@/hooks/use-seller-products'

type SellerLite = { email: string; brandName: string }
type ProductLite = { id: string; name: string; nameEs: string }
type SellerVideo = {
  id: string
  title: string
  description?: string | null
  thumbnail_url?: string | null
  cloudinary_url: string
  cloudinary_public_id: string
  featured_product_ids?: string[] | null
  views_count: number
  active: boolean
  duration_seconds?: number | null
}

type UploadState = {
  url: string
  publicId: string
  thumbnailUrl?: string
  duration?: number
  progress: number
}

export function SellerVideosManager({
  seller,
  products,
}: {
  seller: SellerLite
  products: ProductLite[]
}) {
  const [videos, setVideos] = useState<SellerVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [uploadState, setUploadState] = useState<UploadState | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function loadVideos() {
    setLoading(true)
    try {
      const res = await fetch('/api/seller/videos', { headers: sellerApiHeaders(seller) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error')
      setVideos(json.videos ?? [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar videos')
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadVideos()
  }, [seller])

  const selectedProductSet = useMemo(() => new Set(selectedProductIds), [selectedProductIds])

  function uploadVideo(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('resourceType', 'video')
    formData.append('folder', 'beauty-therapy/seller-videos')

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload')
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadState((current) => ({
          url: current?.url ?? '',
          publicId: current?.publicId ?? '',
          thumbnailUrl: current?.thumbnailUrl,
          duration: current?.duration,
          progress: Math.round((event.loaded / event.total) * 100),
        }))
      }
    }
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText)
        if (xhr.status >= 400) throw new Error(json.error || 'Error al subir video')
        setUploadState({
          url: json.url,
          publicId: json.publicId,
          thumbnailUrl: json.thumbnailUrl,
          duration: json.duration,
          progress: 100,
        })
        toast.success('Video subido correctamente')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al subir video')
        setUploadState(null)
      }
    }
    xhr.onerror = () => {
      toast.error('No se pudo subir el video')
      setUploadState(null)
    }
    setUploadState({ url: '', publicId: '', progress: 0 })
    xhr.send(formData)
  }

  async function createVideo() {
    if (!uploadState?.url || !title.trim()) {
      toast.error('Sube un video y agrega un titulo')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/seller/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...sellerApiHeaders(seller),
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          cloudinaryUrl: uploadState.url,
          cloudinaryPublicId: uploadState.publicId,
          thumbnailUrl: uploadState.thumbnailUrl,
          durationSeconds: uploadState.duration,
          featuredProductIds: selectedProductIds.slice(0, 3),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudo guardar el video')
      toast.success('Video publicado')
      setShowForm(false)
      setTitle('')
      setDescription('')
      setSelectedProductIds([])
      setUploadState(null)
      await loadVideos()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al publicar video')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteVideo(id: string) {
    try {
      const res = await fetch(`/api/seller/videos/${id}`, {
        method: 'DELETE',
        headers: sellerApiHeaders(seller),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'No se pudo eliminar')
      toast.success('Video eliminado')
      await loadVideos()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar video')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Mis videos</CardTitle>
          <p className="text-sm text-muted-foreground">Sube videos cortos para mostrar tus productos.</p>
        </div>
        <Button type="button" onClick={() => setShowForm((current) => !current)}>
          <Plus className="mr-2 h-4 w-4" />
          Subir video
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {showForm && (
          <div className="rounded-2xl border border-border/60 bg-secondary/30 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Archivo de video</Label>
                <Input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  className="mt-1"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) uploadVideo(file)
                  }}
                />
                {uploadState && <p className="mt-2 text-sm text-muted-foreground">Progreso: {uploadState.progress}%</p>}
              </div>
              <div>
                <Label>Titulo</Label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="mt-4">
              <Label>Descripcion</Label>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1" rows={3} />
            </div>

            <div className="mt-4">
              <Label>Productos relacionados (max. 3)</Label>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {products.map((product) => {
                  const checked = selectedProductSet.has(product.id)
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() =>
                        setSelectedProductIds((current) =>
                          checked
                            ? current.filter((id) => id !== product.id)
                            : current.length >= 3
                              ? current
                              : [...current, product.id]
                        )
                      }
                      className={`rounded-xl border px-3 py-2 text-left text-sm ${
                        checked ? 'border-accent bg-accent/5' : 'border-border/60'
                      }`}
                    >
                      {product.nameEs || product.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button type="button" onClick={() => void createVideo()} disabled={submitting}>
                {submitting ? 'Publicando...' : 'Publicar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavia no subes videos.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <div key={video.id} className="rounded-2xl border border-border/60 p-4">
                <div className="mb-3 aspect-[9/16] overflow-hidden rounded-xl bg-muted">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin thumbnail</div>
                  )}
                </div>
                <p className="font-medium">{video.title}</p>
                <p className="text-sm text-muted-foreground">👁 {video.views_count}</p>
                <div className="mt-3 flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)}>
                    Editar manualmente
                  </Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => void deleteVideo(video.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
