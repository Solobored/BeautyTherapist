import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { fetchPublicBlogPosts } from '@/lib/blog-posts'
import { toAbsoluteUrl } from '@/lib/site-url'

export const metadata = {
  title: 'Blog de belleza: tips de skincare, cuidado facial y maquillaje',
  description:
    'Lee tips de belleza, guías de skincare, cuidado facial, ingredientes y tutoriales de maquillaje creados por marcas especialistas.',
  keywords: [
    'tips de belleza',
    'cuidado facial',
    'skincare',
    'rutina de belleza',
    'maquillaje',
    'productos profesionales de belleza',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog de belleza: tips de skincare, cuidado facial y maquillaje',
    description:
      'Lee tips de belleza, guías de skincare, cuidado facial, ingredientes y tutoriales de maquillaje creados por marcas especialistas.',
    type: 'website',
    url: '/blog',
  },
}

const categoryLabels: Record<string, string> = {
  skincare: 'Rutina de Skincare',
  ingredients: 'Guia de Ingredientes',
  makeup: 'Tutorial de Maquillaje',
  wellness: 'Bienestar',
}

export default async function BlogPage() {
  const posts = await fetchPublicBlogPosts().catch(() => [])
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog de belleza Beauty & Therapy',
    description:
      'Tips de belleza, guías de skincare, cuidado facial, ingredientes y tutoriales de maquillaje.',
    url: toAbsoluteUrl('/blog'),
    inLanguage: 'es-CL',
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: toAbsoluteUrl(`/blog/${post.slug}`),
      datePublished: post.publishedAt ?? post.createdAt,
      author: {
        '@type': 'Person',
        name: post.author,
      },
    })),
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
        />
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block font-accent text-xs uppercase tracking-[0.3em] text-accent">
              Journal
            </span>
            <h1 className="font-serif text-3xl font-semibold text-foreground md:text-4xl lg:text-5xl">
              Blog de belleza
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Tips de belleza, tutoriales, ingredientes, cuidado facial y articulos creados por nuestras marcas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const hero = post.images[0]?.url || post.coverImage || '/placeholder.jpg'
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <article className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <Image src={hero} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                        {categoryLabels[post.category] ?? post.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {post.author} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('es-CL') : 'Sin fecha'}
                      </p>
                      <h2 className="mt-3 font-serif text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
                        {post.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.content}</p>
                      <span className="mt-4 inline-flex items-center text-sm font-medium text-accent">
                        Leer articulo
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>

          {posts.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              No hay articulos publicados todavia.
            </div>
          )}

          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/videos">Ver videos de belleza</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
