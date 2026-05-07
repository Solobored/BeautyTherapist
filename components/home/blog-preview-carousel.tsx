'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BlogPostRecord } from '@/lib/blog-posts'

export function BlogPreviewCarousel({ posts }: { posts: BlogPostRecord[] }) {
  const [index, setIndex] = useState(0)
  const visibleCount = Math.min(posts.length, 3)

  useEffect(() => {
    if (posts.length <= 3) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % posts.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [posts.length])

  const visiblePosts =
    posts.length <= 3
      ? posts
      : Array.from({ length: visibleCount }, (_, offset) => posts[(index + offset) % posts.length])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {visiblePosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <article className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={post.images[0]?.url || post.coverImage || '/placeholder.jpg'}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-accent">
                  Leer articulo
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {posts.length > 3 && (
        <div className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" size="icon" onClick={() => setIndex((current) => (current - 1 + posts.length) % posts.length)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            {posts.map((post, dotIndex) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setIndex(dotIndex)}
                className={`h-2.5 w-2.5 rounded-full transition ${dotIndex === index ? 'bg-accent' : 'bg-border'}`}
                aria-label={`Ir al post ${dotIndex + 1}`}
              />
            ))}
          </div>
          <Button type="button" variant="outline" size="icon" onClick={() => setIndex((current) => (current + 1) % posts.length)}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
