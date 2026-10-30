import type { MetadataRoute } from 'next'
import { fetchPublicBlogPosts } from '@/lib/blog-posts'
import { fetchPublicBrands } from '@/lib/brands'
import { policyPages } from '@/lib/policies'
import { seoLandingPages } from '@/lib/seo-landing-pages'
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
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/videos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    ...seoLandingPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...policyPages.map((page) => ({
      url: `${baseUrl}/politicas/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...brands.map((brand) => ({
      url: `${baseUrl}/brands/${brand.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      images: brand.logo && brand.logo.startsWith('http') ? [brand.logo] : undefined,
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/shop/${product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      images: product.imageUrl && product.imageUrl.startsWith('http') ? [product.imageUrl] : undefined,
    })),
  ]
}
