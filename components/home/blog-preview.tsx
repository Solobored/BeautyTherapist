import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchPublicBlogPosts } from '@/lib/blog-posts'
import { BlogPreviewCarousel } from '@/components/home/blog-preview-carousel'

export async function BlogPreview() {
  const posts = await fetchPublicBlogPosts().catch(() => [])

  if (posts.length === 0) return null

  return (
    <section className="bg-secondary/50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block font-accent text-xs uppercase tracking-[0.3em] text-accent">
            Journal
          </span>
          <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">Blog de belleza</h2>
        </div>

        <BlogPreviewCarousel posts={posts} />

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/blog">
              Ver todos los articulos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
