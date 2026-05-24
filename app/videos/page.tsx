import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { VideosPageClient } from '@/components/videos/VideosPageClient'

export const metadata = {
  title: 'Videos de Belleza',
  description: 'Descubre productos de belleza a traves de videos de nuestros vendedores',
  alternates: {
    canonical: '/videos',
  },
  openGraph: {
    title: 'Videos de Belleza',
    description: 'Descubre productos de belleza a traves de videos de nuestros vendedores',
    type: 'website',
    url: '/videos',
  },
}

export default function VideosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <VideosPageClient />
      </main>
      <Footer />
    </div>
  )
}
