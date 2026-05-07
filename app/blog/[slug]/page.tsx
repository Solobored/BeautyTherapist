import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { fetchPublicBlogPostBySlug, fetchPublicBlogPosts } from '@/lib/blog-posts'

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await fetchPublicBlogPostBySlug(slug).catch(() => null)

  if (!post) {
    notFound()
  }

  const relatedPosts = (await fetchPublicBlogPosts().catch(() => [])).filter(
    (candidate) => candidate.category === post.category && candidate.id !== post.id
  ).slice(0, 2)

  const gallery = post.images.length > 0 ? post.images : post.coverImage ? [{ id: 'cover', url: post.coverImage, publicId: 'cover', position: 0 }] : []

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="relative h-64 bg-muted md:h-96">
          <Image src={gallery[0]?.url ?? '/placeholder.jpg'} alt={post.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto -mt-20 px-4 pb-12">
          <article className="mx-auto max-w-4xl rounded-2xl border border-border/50 bg-card p-6 shadow-lg md:p-10">
            <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-foreground">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/blog" className="transition-colors hover:text-foreground">Blog</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="truncate text-foreground">{post.title}</span>
            </nav>

            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {post.author} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('es-CL') : 'Sin fecha'}
            </p>
            <h1 className="mt-4 font-serif text-3xl font-semibold text-foreground md:text-4xl">
              {post.title}
            </h1>

            <div className="mt-8 whitespace-pre-wrap leading-8 text-muted-foreground">{post.content}</div>

            {gallery.length > 1 && (
              <section className="mt-10">
                <h2 className="mb-4 font-serif text-2xl font-semibold text-foreground">Galeria</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {gallery.map((image) => (
                    <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                      <Image src={image.url} alt={image.altText || post.title} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {post.products.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 font-serif text-2xl font-semibold text-foreground">
                  Productos mencionados en este articulo
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {post.products.map((product) => (
                    <Link key={product.id} href={`/shop/${product.id}`} className="rounded-2xl border border-border/60 p-4 transition hover:border-accent/40">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
                          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">CLP {product.price.toLocaleString('es-CL')}</p>
                          <p className="mt-1 text-sm text-accent">Ver producto</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 border-t border-border pt-6">
              <Button variant="outline" asChild>
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al blog
                </Link>
              </Button>
            </div>
          </article>

          {relatedPosts.length > 0 && (
            <section className="mx-auto mt-12 max-w-4xl">
              <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">Articulos relacionados</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="rounded-2xl border border-border/50 bg-card p-4 transition hover:-translate-y-1 hover:shadow-md">
                    <p className="font-serif text-xl font-semibold">{relatedPost.title}</p>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{relatedPost.content}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
