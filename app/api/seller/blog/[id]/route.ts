import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { fetchSellerBlogPostById } from '@/lib/blog-posts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const { id } = await context.params
    const post = await fetchSellerBlogPostById(id, session.brandId)
    if (!post) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('seller blog [id] GET', error)
    return NextResponse.json({ error: 'Error al cargar post' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const { id } = await context.params
    const body = (await request.json()) as {
      title?: string
      content?: string
      category?: string
      coverImage?: string | null
      images?: { url: string; publicId: string; altText?: string | null; position: number }[]
      productIds?: string[]
    }

    const { error: postError } = await supabaseServer
      .from('blog_posts')
      .update({
        title_es: body.title?.trim(),
        title_en: body.title?.trim(),
        content_es: body.content?.trim(),
        content_en: body.content?.trim(),
        category: body.category?.trim() || 'wellness',
        cover_image: body.coverImage ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('brand_id', session.brandId)

    if (postError) {
      return NextResponse.json({ error: postError.message }, { status: 500 })
    }

    await supabaseServer.from('blog_post_images').delete().eq('blog_post_id', id)
    await supabaseServer.from('blog_post_products').delete().eq('blog_post_id', id)

    if (body.images?.length) {
      const { error: imageError } = await supabaseServer.from('blog_post_images').insert(
        body.images.map((image, index) => ({
          blog_post_id: id,
          cloudinary_url: image.url,
          cloudinary_public_id: image.publicId,
          alt_text: image.altText ?? null,
          position: image.position ?? index,
        }))
      )
      if (imageError) {
        return NextResponse.json({ error: imageError.message }, { status: 500 })
      }
    }

    if (body.productIds?.length) {
      const { error: productsError } = await supabaseServer.from('blog_post_products').insert(
        body.productIds.map((productId, index) => ({
          blog_post_id: id,
          product_id: productId,
          position: index,
        }))
      )
      if (productsError) {
        return NextResponse.json({ error: productsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('seller blog [id] PUT', error)
    return NextResponse.json({ error: 'Error al actualizar post' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const { id } = await context.params
    const post = await fetchSellerBlogPostById(id, session.brandId)
    if (!post) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
    }

    await Promise.all(
      post.images.map((image) =>
        cloudinary.uploader.destroy(image.publicId).catch((error) => {
          console.error('cloudinary destroy blog image', error)
        })
      )
    )

    const { error } = await supabaseServer.from('blog_posts').delete().eq('id', id).eq('brand_id', session.brandId)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('seller blog [id] DELETE', error)
    return NextResponse.json({ error: 'Error al eliminar post' }, { status: 500 })
  }
}
