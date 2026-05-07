'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Eye, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VideoItem } from '@/lib/video-types'

interface VideoFeedProps {
  initialVideos: VideoItem[]
  onLoadMore: () => Promise<VideoItem[]>
}

export function VideoFeed({ initialVideos, onLoadMore }: VideoFeedProps) {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos)
  const [muted, setMuted] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const viewedIds = useRef(new Set<string>())

  useEffect(() => {
    setVideos(initialVideos)
  }, [initialVideos])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            void element.play().catch(() => undefined)
            element.muted = muted
            const videoId = element.dataset.videoId
            if (videoId && !viewedIds.current.has(videoId)) {
              viewedIds.current.add(videoId)
              void fetch(`/api/videos/${videoId}/view`, { method: 'POST' })
            }
          } else {
            element.pause()
          }
        })
      },
      { threshold: 0.7 }
    )

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video)
    })

    return () => observer.disconnect()
  }, [videos, muted])

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

  const canLoadMore = useMemo(() => videos.length >= initialVideos.length, [videos.length, initialVideos.length])

  if (videos.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white backdrop-blur">
          <h1 className="font-serif text-3xl font-semibold">Aun no hay videos</h1>
          <p className="mt-3 text-white/70">
            Cuando las marcas suban sus primeros videos, apareceran aqui en formato vertical.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="h-[100dvh] snap-y snap-mandatory overflow-y-auto touch-pan-y"
      >
        {videos.map((video) => (
          <section key={video.id} className="relative flex min-h-[100dvh] snap-start items-center justify-center bg-black px-4 py-8">
            <div className="relative h-full w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-black">
              <video
                ref={(element) => {
                  videoRefs.current[video.id] = element
                }}
                data-video-id={video.id}
                src={video.cloudinaryUrl}
                poster={video.thumbnailUrl}
                playsInline
                muted={muted}
                loop
                preload="metadata"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-x-0 top-0 flex justify-end p-4">
                <Button type="button" variant="secondary" size="icon" onClick={() => setMuted((current) => !current)}>
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 text-white">
                <div className="mb-3 flex items-center gap-3">
                  {video.brandLogoUrl ? (
                    <img src={video.brandLogoUrl} alt={video.brandName} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs">BT</div>
                  )}
                  <div>
                    <p className="font-medium">{video.brandName}</p>
                    <p className="text-sm text-white/70">{video.title}</p>
                  </div>
                </div>

                {video.description && <p className="mb-4 text-sm text-white/80">{video.description}</p>}

                <div className="mb-4 flex items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {video.viewsCount}
                  </span>
                  <span>{video.likesCount} likes</span>
                </div>

                {video.featuredProducts.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {video.featuredProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.slug}`}
                        className="min-w-[220px] rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur"
                      >
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-white/70">CLP {product.price.toLocaleString('es-CL')}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      {canLoadMore && (
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={() => void handleLoadMore()} disabled={loadingMore}>
            {loadingMore ? 'Cargando...' : 'Cargar mas videos'}
          </Button>
        </div>
      )}
    </div>
  )
}
