import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { fetchSellerBlogPosts } from '@/lib/blog-posts'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function slugifyBase(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
    }

    const posts = await fetchSellerBlogPosts(session.brandId)
    return NextResponse.json({ posts })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

type PostBody = {
  title: string
  content: string
  category?: string
  coverImage?: string | null
  imagePublicIds?: string[]
  images?: { url: string; publicId: string; altText?: string | null; position: number }[]
  productIds?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
    }

    const body = (await request.json()) as PostBody
    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ error: 'Título y contenido son obligatorios' }, { status: 400 })
    }

    const title = body.title.trim()
    const content = body.content.trim()
    const unique = `${slugifyBase(title) || 'post'}-${Math.random().toString(36).slice(2, 8)}`

    const row = {
      title_es: title,
      title_en: title,
      slug: unique,
      content_es: content,
      content_en: content,
      cover_image: body.coverImage ?? null,
      category: body.category?.trim() || 'wellness',
      author: session.seller.brandName,
      published_at: new Date().toISOString(),
      brand_id: session.brandId,
    }

    const { data, error } = await supabaseServer.from('blog_posts').insert(row).select('id, slug').single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const images = body.images ?? []
    if (images.length > 0 && data?.id) {
      const { error: imagesError } = await supabaseServer.from('blog_post_images').insert(
        images.map((image, index) => ({
          blog_post_id: data.id,
          cloudinary_url: image.url,
          cloudinary_public_id:
            image.publicId || body.imagePublicIds?.[index] || image.url,
          alt_text: image.altText ?? null,
          position: image.position ?? index,
        }))
      )

      if (imagesError) {
        return NextResponse.json({ error: imagesError.message }, { status: 500 })
      }
    }

    if (body.productIds?.length && data?.id) {
      const { error: productsError } = await supabaseServer.from('blog_post_products').insert(
        body.productIds.map((productId, index) => ({
          blog_post_id: data.id,
          product_id: productId,
          position: index,
        }))
      )

      if (productsError) {
        return NextResponse.json({ error: productsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, id: data?.id, slug: data?.slug })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
