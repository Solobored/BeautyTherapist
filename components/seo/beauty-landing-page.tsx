import Link from 'next/link'
import { ArrowRight, CheckCircle2, Search } from 'lucide-react'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import type { SeoLandingPage } from '@/lib/seo-landing-pages'
import { getAllActiveProducts } from '@/lib/storefront-products'
import { toAbsoluteUrl } from '@/lib/site-url'

type BeautyLandingPageProps = {
  page: SeoLandingPage
}

export async function BeautyLandingPage({ page }: BeautyLandingPageProps) {
  const products = await getAllActiveProducts()
  const featuredProducts = products
    .filter((product) => !page.category || product.category === page.category)
    .slice(0, 8)

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.title,
    itemListElement: featuredProducts.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: toAbsoluteUrl(`/shop/${product.id}`),
      name: product.nameEs || product.name,
    })),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <section className="border-b border-border/50 bg-gradient-to-b from-secondary/60 to-background">
          <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-20">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent shadow-sm">
                <Search className="h-3.5 w-3.5" />
                {page.heroEyebrow}
              </span>
              <h1 className="font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl lg:text-6xl">
                {page.heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                {page.heroDescription}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/shop">
                    Ver tienda
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/blog">Leer guías de belleza</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Búsquedas que resolvemos
              </h2>
              <div className="mt-5 space-y-4">
                {page.searchIntents.map((intent) => (
                  <div key={intent} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <p className="text-sm leading-6 text-muted-foreground">{intent}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-foreground">
                Productos recomendados
              </h2>
              <p className="mt-2 text-muted-foreground">
                Catálogo seleccionado para personas que buscan {page.shortTitle.toLowerCase()}.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/shop">Explorar todos los productos</Link>
            </Button>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-muted-foreground">
              Aún no hay productos publicados en esta categoría. Puedes revisar la tienda completa.
            </div>
          )}
        </section>

        <section className="container mx-auto px-4 pb-14">
          <div className="grid gap-6 md:grid-cols-2">
            {page.faq.map((item) => (
              <article key={item.question} className="rounded-2xl border border-border/60 bg-card p-6">
                <h2 className="font-serif text-xl font-semibold text-foreground">{item.question}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
