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
    <section className="py-8 md:py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-5 flex flex-row items-end justify-between gap-3 md:mb-10 md:gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-accent md:text-xs md:tracking-[0.3em]">Videos</span>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground md:mt-3 md:text-4xl">
              Videos de belleza
            </h2>
            <p className="mt-1 hidden max-w-2xl text-sm text-muted-foreground sm:block md:mt-3 md:text-base">
              Descubre productos en formato corto, vertical y pensado para mobile.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 md:h-9 md:px-4">
            <Link href="/videos">
              Ver mas videos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card p-5 text-left md:rounded-3xl md:p-10 md:text-center">
            <h3 className="font-serif text-xl font-semibold text-foreground md:text-2xl">Aun no hay videos</h3>
            <p className="mt-2 text-sm text-muted-foreground md:mt-3 md:text-base">
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
