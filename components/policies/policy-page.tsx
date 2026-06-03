import Link from 'next/link'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import type { PolicyPage as PolicyPageData } from '@/lib/policies'

export function PolicyPage({ page }: { page: PolicyPageData }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="border-b border-border/50 bg-secondary/40">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <nav className="mb-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Inicio</Link>
              <span className="mx-2">/</span>
              <span>{page.title}</span>
            </nav>
            <h1 className="font-serif text-4xl font-semibold text-foreground md:text-5xl">
              {page.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              {page.description}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Última actualización: {new Date(page.updatedAt).toLocaleDateString('es-CL')}
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-border/60 bg-card p-6 text-sm leading-7 text-muted-foreground md:p-8">
            <p>
              Este contenido es informativo y está pensado para transparentar condiciones de uso,
              compra y postventa. Si una norma imperativa de protección al consumidor aplica, esa
              norma prevalece sobre cualquier política interna.
            </p>
          </div>

          <div className="mt-8 space-y-8">
            {page.sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
                <h2 className="font-serif text-2xl font-semibold text-foreground">{section.title}</h2>
                <div className="mt-4 space-y-4 text-muted-foreground">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="leading-8">{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
