import type { Metadata } from 'next'
import { BeautyLandingPage } from '@/components/seo/beauty-landing-page'
import { getSeoLandingPage } from '@/lib/seo-landing-pages'
import { toAbsoluteUrl } from '@/lib/site-url'

const page = getSeoLandingPage('maquillaje-profesional')!

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

export default function MaquillajeProfesionalPage() {
  return <BeautyLandingPage page={page} />
}
