import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoCard } from '@/components/videos/VideoCard'
import { fetchPublicVideos } from '@/lib/videos'

export async function VideosPreview() {
  noStore()
  const videos = await fetchPublicVideos({ limit: 1, sortBy: 'most-viewed' }).catch(() => [])
  const featuredVideo = videos[0]

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-accent">Videos</span>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-foreground md:text-4xl">
              Videos de belleza
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Descubre productos en formato corto, vertical y pensado para mobile.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/videos">
              Ver mas videos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-3xl border border-border/60 bg-card p-10 text-center">
            <h3 className="font-serif text-2xl font-semibold text-foreground">Aun no hay videos</h3>
            <p className="mt-3 text-muted-foreground">
              Pronto veras demostraciones, rutinas y presentaciones de productos aqui.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/videos">Ir a la seccion de videos</Link>
            </Button>
          </div>
        ) : (
          <div className="mx-auto max-w-sm">
            {featuredVideo ? <VideoCard video={featuredVideo} /> : null}
          </div>
        )}

        {featuredVideo ? (
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/videos">
                Ver mas videos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
