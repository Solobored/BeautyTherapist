'use client'

import Link from 'next/link'
import { VideoItem } from '@/lib/video-types'

export function VideoCard({ video }: { video: VideoItem }) {
  return (
    <Link href="/videos" className="group block">
      <article className="overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="aspect-[9/16] overflow-hidden bg-muted">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin preview</div>
          )}
        </div>
        <div className="p-4">
          <p className="font-medium">{video.title}</p>
          <p className="text-sm text-muted-foreground">{video.brandName}</p>
        </div>
      </article>
    </Link>
  )
}
