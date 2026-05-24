import type { MetadataRoute } from 'next'
import { fetchPublicBlogPosts } from '@/lib/blog-posts'
import { fetchPublicBrands } from '@/lib/brands'
import { getAllActiveProducts } from '@/lib/storefront-products'
import { getSiteUrl } from '@/lib/site-url'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()
  const [products, posts, brands] = await Promise.all([
    getAllActiveProducts(),
    fetchPublicBlogPosts().catch(() => []),
    fetchPublicBrands().catch(() => []),
  ])

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
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt),
    })),
    ...brands.map((brand) => ({
      url: `${baseUrl}/brands/${brand.slug}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/shop/${product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    })),
  ]
}
