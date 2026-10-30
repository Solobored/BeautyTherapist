import type { Metadata } from 'next'
import { fetchPublicBrandBySlug } from '@/lib/brands'
import { getAllActiveProducts } from '@/lib/storefront-products'
import { buildBrandSchema, buildBreadcrumbSchema, jsonLd } from '@/lib/seo'
import { toAbsoluteUrl } from '@/lib/site-url'

type BrandLayoutProps = {
  children: React.ReactNode
  params: Promise<{ brand: string }>
}

export const revalidate = 3600

const clip = (text: string, max = 158) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

export async function generateMetadata({ params }: BrandLayoutProps): Promise<Metadata> {
  const { brand: brandSlug } = await params
  const brand = await fetchPublicBrandBySlug(brandSlug)
  const canonical = toAbsoluteUrl(`/brands/${brandSlug}`)

  if (!brand) {
    return { title: 'Marca no encontrada', robots: { index: false, follow: false } }
  }

  const title = `${brand.name} | Comprar skincare y maquillaje en Chile`
  const description = clip(
    brand.description?.trim() ||
      `Compra productos de ${brand.name} en Beauty & Therapy: skincare y maquillaje con envío a todo Chile.`
  )
  const image = brand.banner && !brand.banner.endsWith('placeholder.svg') ? brand.banner : brand.logo

  return {
    title: { absolute: title },
    description,
    keywords: [brand.name, `${brand.name} Chile`, `comprar ${brand.name}`, 'skincare', 'maquillaje'],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'Beauty & Therapy',
      locale: 'es_CL',
      images: image ? [{ url: image, alt: brand.name }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
  }
}

export default async function BrandLayout({ children, params }: BrandLayoutProps) {
  const { brand: brandSlug } = await params
  const [brand, products] = await Promise.all([
    fetchPublicBrandBySlug(brandSlug),
    getAllActiveProducts().catch(() => []),
  ])

  const schemas = brand
    ? [
        buildBrandSchema({
          name: brand.name,
          slug: brand.slug,
          description: brand.description,
          logo: brand.logo,
          banner: brand.banner,
          sameAs: [brand.instagram, brand.facebook, brand.tiktok],
          products: products
            .filter((p) => p.brandSlug === brand.slug)
            .map((p) => ({ id: p.id, name: p.nameEs?.trim() || p.name, image: p.imageUrl, price: p.price, inStock: p.stock > 0 })),
        }),
        buildBreadcrumbSchema([
          { name: 'Inicio', path: '/' },
          { name: 'Marcas', path: '/shop' },
          { name: brand.name, path: `/brands/${brand.slug}` },
        ]),
      ]
    : []

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      ))}
      {children}
    </>
  )
}
