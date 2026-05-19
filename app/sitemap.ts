import type { MetadataRoute } from 'next'
import { getAllActiveProducts } from '@/lib/storefront-products'
import { getSiteUrl } from '@/lib/site-url'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()
  const products = await getAllActiveProducts()

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/videos`,
      lastModified: new Date(),
    },
    ...products.map((product) => ({
      url: `${baseUrl}/shop/${product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    })),
  ]
}
