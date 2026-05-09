'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Pencil, Plus, Trash2, Video } from 'lucide-react'
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
  fileName?: string
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
  const [productSearch, setProductSearch] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [uploadState, setUploadState] = useState<UploadState | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  async function loadVideos() {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch('/api/seller/videos', { headers: sellerApiHeaders(seller) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error')
      setVideos(json.videos ?? [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar videos'
      toast.error(message)
      setLoadError(message)
    } finally {
      setHasLoadedOnce(true)
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadVideos()
  }, [seller])

  const selectedProductSet = useMemo(() => new Set(selectedProductIds), [selectedProductIds])
  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()
    if (!query) return products
    return products.filter((product) =>
      `${product.nameEs || ''} ${product.name || ''}`.toLowerCase().includes(query)
    )
  }, [productSearch, products])

  function resetForm() {
    setEditingVideoId(null)
    setShowForm(false)
    setTitle('')
    setDescription('')
    setProductSearch('')
    setSelectedProductIds([])
    setUploadState(null)
    setSubmitting(false)
  }

  function beginCreateVideo() {
    resetForm()
    setShowForm(true)
  }

  function beginEditVideo(video: SellerVideo) {
    setEditingVideoId(video.id)
    setShowForm(true)
    setTitle(video.title ?? '')
    setDescription(video.description ?? '')
    setSelectedProductIds((video.featured_product_ids ?? []).slice(0, 3))
    setProductSearch('')
    setUploadState({
      url: video.cloudinary_url,
      publicId: video.cloudinary_public_id,
      thumbnailUrl: video.thumbnail_url ?? undefined,
      duration: video.duration_seconds ?? undefined,
      progress: 100,
      fileName: video.title,
    })
  }

  async function readVideoDuration(file: File) {
    return await new Promise<number>((resolve, reject) => {
      const preview = document.createElement('video')
      preview.preload = 'metadata'
      preview.onloadedmetadata = () => {
        const duration = preview.duration
        URL.revokeObjectURL(preview.src)
        if (!Number.isFinite(duration) || duration <= 0) {
          reject(new Error('No se pudo leer la duracion del video.'))
          return
        }
        resolve(duration)
      }
      preview.onerror = () => {
        URL.revokeObjectURL(preview.src)
        reject(new Error('No se pudo validar el archivo de video.'))
      }
      preview.src = URL.createObjectURL(file)
    })
  }

  async function uploadVideo(file: File) {
    try {
      const duration = await readVideoDuration(file)
      if (duration > 60 * 60) {
        toast.error('El video supera el maximo permitido de 60 minutos.')
        return
      }

      const signatureRes = await fetch('/api/upload/video-signature', {
        method: 'POST',
        headers: sellerApiHeaders(seller),
      })
      const signatureRaw = await signatureRes.text()
      let signatureJson: Record<string, unknown> = {}
      try {
        signatureJson = signatureRaw ? (JSON.parse(signatureRaw) as Record<string, unknown>) : {}
      } catch {
        throw new Error(`Respuesta inesperada al preparar la subida: ${signatureRaw.slice(0, 180)}`)
      }
      if (!signatureRes.ok) {
        throw new Error(String(signatureJson.error ?? 'No se pudo preparar la subida del video'))
      }

      const cloudName = String(signatureJson.cloudName ?? '')
      const apiKey = String(signatureJson.apiKey ?? '')
      const timestamp = String(signatureJson.timestamp ?? '')
      const signature = String(signatureJson.signature ?? '')
      const folder = String(signatureJson.folder ?? 'beauty-therapy/seller-videos')
      const eager = String(signatureJson.eager ?? '')
      const transformation = String(signatureJson.transformation ?? '')
      const format = String(signatureJson.format ?? 'mp4')

      if (!cloudName || !apiKey || !timestamp || !signature) {
        throw new Error('Faltan datos para la subida directa del video.')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('folder', folder)
      formData.append('eager', eager)
      formData.append('transformation', transformation)
      formData.append('format', format)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadState((current) => ({
            url: current?.url ?? '',
            publicId: current?.publicId ?? '',
            thumbnailUrl: current?.thumbnailUrl,
            duration,
            progress: Math.round((event.loaded / event.total) * 100),
            fileName: current?.fileName ?? file.name,
          }))
        }
      }
      xhr.onload = () => {
        try {
          const raw = xhr.responseText?.trim() ?? ''
          if (!raw) {
            throw new Error('Cloudinary respondio vacio al subir el video.')
          }
          const json = JSON.parse(raw) as {
            error?: { message?: string }
            secure_url?: string
            public_id?: string
            eager?: Array<{ secure_url?: string }>
            duration?: number
          }
          if (xhr.status >= 400) throw new Error(json.error?.message || 'Error al subir video')
          const uploadedUrl = String(json.secure_url ?? '').trim()
          const publicId = String(json.public_id ?? '').trim()
          if (!uploadedUrl || !publicId) {
            throw new Error('Cloudinary no devolvio un video valido.')
          }
          setUploadState({
            url: uploadedUrl,
            publicId,
            thumbnailUrl:
              json.eager?.[0]?.secure_url ||
              uploadedUrl.replace('/video/upload/', '/video/upload/so_0,f_webp,w_400,h_711,c_fill/'),
            duration: typeof json.duration === 'number' ? json.duration : duration,
            progress: 100,
            fileName: file.name,
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
      setUploadState({ url: '', publicId: '', duration, progress: 0, fileName: file.name })
      xhr.send(formData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al preparar el video')
      setUploadState(null)
    }
  }

  async function saveVideo() {
    if (!uploadState?.url || !title.trim()) {
      toast.error('Sube un video y agrega un titulo')
      return
    }

    setSubmitting(true)
    try {
      const isEditing = Boolean(editingVideoId)
      const res = await fetch(isEditing ? `/api/seller/videos/${editingVideoId}` : '/api/seller/videos', {
        method: isEditing ? 'PUT' : 'POST',
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
      const raw = await res.text()
      let json: Record<string, unknown> = {}
      try {
        json = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
      } catch {
        throw new Error(`Respuesta inesperada al guardar video: ${raw.slice(0, 180)}`)
      }
      if (!res.ok) throw new Error(String(json.error ?? 'No se pudo guardar el video'))
      toast.success(isEditing ? 'Video actualizado' : 'Video publicado')
      resetForm()
      await loadVideos()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar video')
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
        <Button type="button" onClick={beginCreateVideo}>
          <Plus className="mr-2 h-4 w-4" />
          Subir video
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {showForm && (
          <div className="rounded-2xl border border-border/60 bg-secondary/30 p-5">
            <div className="mb-4">
              <p className="font-medium">{editingVideoId ? 'Editar video' : 'Subir video'}</p>
              <p className="text-sm text-muted-foreground">
                {editingVideoId
                  ? 'Modifica titulo, descripcion, productos relacionados o reemplaza el archivo.'
                  : 'Sube un video nuevo. Ahora el archivo va directo a Cloudinary para evitar cortes por tamano.'}
              </p>
            </div>
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
                {uploadState && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Progreso: {uploadState.progress}%</p>
                    <p>{uploadState.url ? `Archivo listo: ${uploadState.fileName ?? 'video'}` : 'Subiendo video...'}</p>
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  El video se sube directo a Cloudinary, se optimiza automaticamente y acepta hasta 60 minutos.
                </p>
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
              <Input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Buscar productos..."
                className="mt-2"
              />
              <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto md:grid-cols-2">
                {filteredProducts.map((product) => {
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
                {filteredProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No se encontraron productos con esa busqueda.</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button type="button" onClick={() => void saveVideo()} disabled={submitting}>
                {submitting ? (editingVideoId ? 'Guardando...' : 'Publicando...') : editingVideoId ? 'Guardar cambios' : 'Publicar'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {loading || !hasLoadedOnce ? (
          <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/20">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando videos subidos...</span>
            </div>
          </div>
        ) : loadError ? (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/20 px-4 text-center">
            <Video className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No pudimos cargar tus videos.</p>
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <Button type="button" variant="outline" className="mt-4" onClick={() => void loadVideos()}>
              Reintentar
            </Button>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/20 px-4 text-center">
            <Video className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Todavía no subes videos.</p>
            <p className="text-sm text-muted-foreground">
              Cuando publiques tu primer video, aparecerá aquí junto a sus ediciones y estadísticas.
            </p>
          </div>
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
                  <Button type="button" variant="outline" size="sm" onClick={() => beginEditVideo(video)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
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
