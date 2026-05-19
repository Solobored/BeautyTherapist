import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from '@/components/product-detail-client'
import { getActiveProductById, getAllActiveProducts, getRelatedActiveProducts } from '@/lib/storefront-products'
import { toAbsoluteUrl } from '@/lib/site-url'

export const revalidate = 300

type ProductPageProps = {
  params: Promise<{ id: string }>
}

function productDescription(description: string) {
  return description.trim().slice(0, 160)
}

export async function generateStaticParams() {
  const products = await getAllActiveProducts()
  return products.map((product) => ({ id: product.id }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getActiveProductById(id)

  if (!product) {
    return {
      title: 'Producto no encontrado',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const name = product.nameEs?.trim() || product.name
  const description = productDescription(product.descriptionEs?.trim() || product.description || name)
  const image = product.images[0] ? toAbsoluteUrl(product.images[0]) : toAbsoluteUrl('/placeholder.jpg')
  const canonical = toAbsoluteUrl(`/shop/${product.id}`)

  return {
    title: name,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: name,
      description,
      url: canonical,
      type: 'website',
      images: [
        {
          url: image,
          alt: name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description,
      images: [image],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getActiveProductById(id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedActiveProducts(product)
  const name = product.nameEs?.trim() || product.name
  const description = product.descriptionEs?.trim() || product.description || name
  const imageUrls = product.images.map((image) => toAbsoluteUrl(image))

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: imageUrls,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: toAbsoluteUrl(`/shop/${product.id}`),
      price: product.price,
      priceCurrency: 'CLP',
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  )
}
