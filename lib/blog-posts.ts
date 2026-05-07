import { supabaseServer } from '@/lib/supabase'
import { blogPosts as fallbackBlogPosts } from '@/lib/data'

export type BlogImage = {
  id: string
  url: string
  publicId: string
  altText?: string | null
  position: number
}

export type BlogAttachedProduct = {
  id: string
  name: string
  imageUrl: string
  price: number
}

export type BlogPostRecord = {
  id: string
  slug: string
  title: string
  content: string
  coverImage: string | null
  category: string
  author: string
  publishedAt: string | null
  createdAt: string
  brandId?: string | null
  images: BlogImage[]
  products: BlogAttachedProduct[]
}

function getFallbackPosts(): BlogPostRecord[] {
  return fallbackBlogPosts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.excerpt || post.content,
    coverImage: post.coverImage,
    category: post.category,
    author: post.author,
    publishedAt: post.date,
    createdAt: post.date,
    brandId: null,
    images: [
      {
        id: `${post.id}-cover`,
        url: post.coverImage,
        publicId: `${post.id}-cover`,
        altText: post.title,
        position: 0,
      },
    ],
    products: [],
  }))
}

function mapProduct(product: {
  id: string
  name_es: string
  name_en: string
  price: number
  product_images?: { url: string; position: number | null }[] | null
}): BlogAttachedProduct {
  const imageUrl =
    product.product_images?.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url ??
    '/placeholder.svg'

  return {
    id: product.id,
    name: product.name_es || product.name_en,
    imageUrl,
    price: Number(product.price ?? 0),
  }
}

function mapPost(post: {
  id: string
  slug: string
  title_es: string
  title_en: string
  content_es: string
  content_en: string
  cover_image: string | null
  category: string | null
  author: string | null
  published_at: string | null
  created_at: string
  brand_id?: string | null
  blog_post_images?: {
    id: string
    cloudinary_url: string
    cloudinary_public_id: string
    alt_text: string | null
    position: number
  }[] | null
  blog_post_products?: {
    position: number
    products: {
      id: string
      name_es: string
      name_en: string
      price: number
      product_images?: { url: string; position: number | null }[] | null
    } | null
  }[] | null
}): BlogPostRecord {
  const images =
    post.blog_post_images
      ?.slice()
      .sort((a, b) => a.position - b.position)
      .map((image) => ({
        id: image.id,
        url: image.cloudinary_url,
        publicId: image.cloudinary_public_id,
        altText: image.alt_text,
        position: image.position,
      })) ?? []

  const products =
    post.blog_post_products
      ?.slice()
      .sort((a, b) => a.position - b.position)
      .map((row) => row.products)
      .filter((product): product is NonNullable<typeof product> => Boolean(product))
      .map(mapProduct) ?? []

  return {
    id: post.id,
    slug: post.slug,
    title: post.title_es || post.title_en,
    content: post.content_es || post.content_en,
    coverImage: post.cover_image,
    category: post.category || 'wellness',
    author: post.author || 'BeautyTherapist',
    publishedAt: post.published_at,
    createdAt: post.created_at,
    brandId: post.brand_id,
    images,
    products,
  }
}

const blogSelect = `
  id,
  slug,
  title_es,
  title_en,
  content_es,
  content_en,
  cover_image,
  category,
  author,
  published_at,
  created_at,
  brand_id,
  blog_post_images (
    id,
    cloudinary_url,
    cloudinary_public_id,
    alt_text,
    position
  ),
  blog_post_products (
    position,
    products (
      id,
      name_es,
      name_en,
      price,
      product_images (
        url,
        position
      )
    )
  )
`

type RawBlogPost = Parameters<typeof mapPost>[0]

export async function fetchPublicBlogPosts() {
  const { data, error } = await supabaseServer
    .from('blog_posts')
    .select(blogSelect)
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error) return getFallbackPosts()
  const mapped = (data ?? []).map((post) => mapPost(post as unknown as RawBlogPost))
  return mapped.length > 0 ? mapped : getFallbackPosts()
}

export async function fetchPublicBlogPostBySlug(slug: string) {
  const { data, error } = await supabaseServer
    .from('blog_posts')
    .select(blogSelect)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    return getFallbackPosts().find((post) => post.slug === slug) ?? null
  }
  return data ? mapPost(data as unknown as RawBlogPost) : getFallbackPosts().find((post) => post.slug === slug) ?? null
}

export async function fetchSellerBlogPosts(brandId: string) {
  const { data, error } = await supabaseServer
    .from('blog_posts')
    .select(blogSelect)
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((post) => mapPost(post as unknown as RawBlogPost))
}

export async function fetchSellerBlogPostById(id: string, brandId: string) {
  const { data, error } = await supabaseServer
    .from('blog_posts')
    .select(blogSelect)
    .eq('id', id)
    .eq('brand_id', brandId)
    .maybeSingle()

  if (error) throw error
  return data ? mapPost(data as unknown as RawBlogPost) : null
}
