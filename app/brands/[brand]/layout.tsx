import type { Metadata } from 'next'
import { fetchPublicBrandBySlug } from '@/lib/brands'
import { toAbsoluteUrl } from '@/lib/site-url'

type BrandLayoutProps = {
  children: React.ReactNode
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: BrandLayoutProps): Promise<Metadata> {
  const { brand: brandSlug } = await params
  const brand = await fetchPublicBrandBySlug(brandSlug)
  const canonical = toAbsoluteUrl(`/brands/${brandSlug}`)
  const title = brand ? `${brand.name} | Marca de belleza` : 'Marca'
  const description =
    brand?.description?.trim() ||
    'Descubre productos, historia y novedades de esta marca en Beauty & Therapy.'

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: brand?.logo
        ? [
            {
              url: brand.logo,
              alt: brand.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: brand?.logo ? [brand.logo] : undefined,
    },
  }
}

export default function BrandLayout({ children }: BrandLayoutProps) {
  return children
}
