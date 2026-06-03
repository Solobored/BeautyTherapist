import type { Metadata } from 'next'
import { BeautyLandingPage } from '@/components/seo/beauty-landing-page'
import { getSeoLandingPage } from '@/lib/seo-landing-pages'
import { toAbsoluteUrl } from '@/lib/site-url'

const page = getSeoLandingPage('productos-profesionales-belleza')!

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: {
    canonical: toAbsoluteUrl(`/${page.slug}`),
  },
  openGraph: {
    title: page.title,
    description: page.description,
    url: toAbsoluteUrl(`/${page.slug}`),
    type: 'website',
  },
}

export default function ProductosProfesionalesBellezaPage() {
  return <BeautyLandingPage page={page} />
}
