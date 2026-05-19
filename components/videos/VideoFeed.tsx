'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Eye, Heart, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VideoItem } from '@/lib/video-types'

interface VideoFeedProps {
  initialVideos: VideoItem[]
  onLoadMore: () => Promise<VideoItem[]>
  hasMore?: boolean
  isInitialLoading?: boolean
}

export function VideoFeed({ initialVideos, onLoadMore, hasMore = false, isInitialLoading = false }: VideoFeedProps) {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos)
  const [muted, setMuted] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({})
  const [errorMap, setErrorMap] = useState<Record<string, boolean>>({})
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})
  const [likeLoadingMap, setLikeLoadingMap] = useState<Record<string, boolean>>({})
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const viewedIds = useRef(new Set<string>())

  useEffect(() => {
    setVideos(initialVideos)
  }, [initialVideos])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const nextMap: Record<string, boolean> = {}
    initialVideos.forEach((video) => {
      nextMap[video.id] = window.localStorage.getItem(`video-liked:${video.id}`) === 'true'
    })
    setLikedMap(nextMap)
  }, [initialVideos])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLVideoElement
          const videoId = element.dataset.videoId
          if (entry.isIntersecting) {
            element.muted = muted
            void element.play().catch(() => {
              if (videoId) {
                setPlayingMap((current) => ({ ...current, [videoId]: false }))
              }
            })
            if (videoId && !viewedIds.current.has(videoId)) {
              viewedIds.current.add(videoId)
              void fetch(`/api/videos/${videoId}/view`, { method: 'POST' })
            }
          } else {
            element.pause()
            if (videoId) {
              setPlayingMap((current) => ({ ...current, [videoId]: false }))
            }
          }
        })
      },
      { threshold: 0.72 }
    )

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video)
    })

    return () => observer.disconnect()
  }, [videos, muted])

  async function togglePlayback(videoId: string) {
    const element = videoRefs.current[videoId]
    if (!element) return

    if (element.paused) {
      element.muted = muted
      try {
        await element.play()
        setPlayingMap((current) => ({ ...current, [videoId]: true }))
      } catch {
        setPlayingMap((current) => ({ ...current, [videoId]: false }))
      }
      return
    }

    element.pause()
    setPlayingMap((current) => ({ ...current, [videoId]: false }))
  }

  async function handleLoadMore() {
    if (loadingMore) return
    setLoadingMore(true)
    try {
      const next = await onLoadMore()
      if (next.length > 0) {
        setVideos((current) => [...current, ...next])
      }
    } finally {
      setLoadingMore(false)
    }
  }

  const canLoadMore = useMemo(() => hasMore, [hasMore])

  async function toggleLike(videoId: string) {
    if (likeLoadingMap[videoId]) return

    const nextLiked = !likedMap[videoId]
    setLikeLoadingMap((current) => ({ ...current, [videoId]: true }))

    const previousVideos = videos
    setLikedMap((current) => ({ ...current, [videoId]: nextLiked }))
    setVideos((current) =>
      current.map((video) =>
        video.id === videoId
          ? {
              ...video,
              likesCount: Math.max(0, video.likesCount + (nextLiked ? 1 : -1)),
            }
          : video
      )
    )

    try {
      const res = await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: nextLiked }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string; likesCount?: number }
      if (!res.ok) throw new Error(json.error || 'No se pudo actualizar el like')

      if (typeof window !== 'undefined') {
        if (nextLiked) {
          window.localStorage.setItem(`video-liked:${videoId}`, 'true')
        } else {
          window.localStorage.removeItem(`video-liked:${videoId}`)
        }
      }

      if (typeof json.likesCount === 'number') {
        setVideos((current) =>
          current.map((video) =>
            video.id === videoId
              ? {
                  ...video,
                  likesCount: json.likesCount ?? video.likesCount,
                }
              : video
          )
        )
      }
    } catch {
      setLikedMap((current) => ({ ...current, [videoId]: !nextLiked }))
      setVideos(previousVideos)
    } finally {
      setLikeLoadingMap((current) => ({ ...current, [videoId]: false }))
    }
  }

  if (isInitialLoading && videos.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-4 h-3 w-28 animate-pulse rounded-full bg-muted" />
          <div className="mb-3 h-6 w-3/4 animate-pulse rounded-full bg-muted" />
          <div className="mb-8 h-4 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-accent" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando videos...</p>
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="max-w-lg rounded-3xl border border-border bg-card p-10 text-center text-foreground shadow-sm">
          <h1 className="font-serif text-3xl font-semibold">Aun no hay videos</h1>
          <p className="mt-3 text-muted-foreground">
            Cuando las marcas suban sus primeros videos, apareceran aqui en formato vertical.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div ref={containerRef} className="h-[calc(100dvh-4rem)] snap-y snap-mandatory overflow-y-auto touch-pan-y">
        {videos.map((video) => (
          <section
            key={video.id}
            className="relative flex min-h-[calc(100dvh-4rem)] snap-start items-center justify-center bg-background"
          >
            <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-black md:h-[calc(100dvh-6rem)] md:max-w-md md:rounded-[1.75rem] md:shadow-[0_22px_60px_rgba(32,27,21,0.16)]">
              <video
                ref={(element) => {
                  videoRefs.current[video.id] = element
                }}
                data-video-id={video.id}
                src={video.cloudinaryUrl}
                poster={video.thumbnailUrl}
                playsInline
                autoPlay
                muted={muted}
                loop
                preload="metadata"
                onClick={() => void togglePlayback(video.id)}
                onPlay={() => setPlayingMap((current) => ({ ...current, [video.id]: true }))}
                onPause={() => setPlayingMap((current) => ({ ...current, [video.id]: false }))}
                onError={() => setErrorMap((current) => ({ ...current, [video.id]: true }))}
                className="h-full w-full cursor-pointer object-cover"
              />

              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
                <div className="rounded-full bg-white/88 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
                  Videos
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="pointer-events-auto border border-white/30 bg-white/88 text-foreground hover:bg-white"
                  onClick={() => setMuted((current) => !current)}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>

              {!errorMap[video.id] && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="pointer-events-auto h-14 w-14 rounded-full bg-black/55 text-white hover:bg-black/70"
                    onClick={() => void togglePlayback(video.id)}
                  >
                    {playingMap[video.id] ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
                  </Button>
                </div>
              )}

              {errorMap[video.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center text-sm text-white/80">
                  No se pudo reproducir este video. Intenta volver a subirlo o revisa el archivo en Cloudinary.
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-4 text-white md:p-5">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      {video.brandLogoUrl ? (
                        <img src={video.brandLogoUrl} alt={video.brandName} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs">BT</div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{video.brandName}</p>
                        <p className="truncate text-sm text-white/70">{video.title}</p>
                      </div>
                    </div>

                    {video.description && (
                      <p className="mb-4 max-w-sm text-sm leading-6 text-white/80">{video.description}</p>
                    )}

                    {video.featuredProducts.length > 0 && (
                      <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1">
                        {video.featuredProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="min-w-[170px] rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur"
                          >
                            <p className="truncate text-sm font-medium text-white">{product.name}</p>
                            <p className="text-xs text-white/70">CLP {product.price.toLocaleString('es-CL')}</p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pointer-events-auto flex shrink-0 flex-col items-center gap-3 pb-2">
                    <div className="rounded-full bg-white/10 px-3 py-2 text-xs text-white backdrop-blur">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {video.viewsCount}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className={`h-12 w-12 rounded-full border border-white/20 text-white hover:bg-white/20 ${
                          likedMap[video.id] ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'bg-white/12'
                        }`}
                        disabled={likeLoadingMap[video.id]}
                        onClick={() => void toggleLike(video.id)}
                      >
                        <Heart className={`h-4 w-4 ${likedMap[video.id] ? 'fill-current' : ''}`} />
                      </Button>
                      <span className="text-xs text-white/85">{video.likesCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {canLoadMore && (
        <div className="flex justify-center py-6">
          <Button type="button" variant="outline" onClick={() => void handleLoadMore()} disabled={loadingMore}>
            {loadingMore ? 'Cargando...' : 'Cargar mas videos'}
          </Button>
        </div>
      )}
    </div>
  )
}
