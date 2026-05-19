'use client'

import { useEffect, useState } from 'react'
import { VideoFeed } from '@/components/videos/VideoFeed'
import type { VideoItem } from '@/lib/video-types'

export function VideosPageClient() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/videos?limit=10', { cache: 'no-store' })
        const json = await res.json()
        if (!cancelled) {
          setVideos(json.videos ?? [])
          setCursor(json.nextCursor ?? null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleLoadMore() {
    if (!cursor) return []
    const res = await fetch(`/api/videos?limit=10&cursor=${encodeURIComponent(cursor)}`, { cache: 'no-store' })
    const json = await res.json()
    setCursor(json.nextCursor ?? null)
    return (json.videos ?? []) as VideoItem[]
  }

  return <VideoFeed initialVideos={videos} onLoadMore={handleLoadMore} hasMore={Boolean(cursor)} isInitialLoading={loading} />
}
