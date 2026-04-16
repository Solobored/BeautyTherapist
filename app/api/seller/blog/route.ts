import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

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

    const { data, error } = await supabaseServer
      .from('blog_posts')
      .select('id, title_es, title_en, slug, category, author, published_at, created_at, cover_image, brand_id')
      .eq('brand_id', session.brandId)
      .order('created_at', { ascending: false })

    if (error) {
      if (error.message?.includes('brand_id') || error.code === '42703') {
        return NextResponse.json({
          posts: [],
          notice:
            'Ejecuta la migración en Supabase (columna brand_id en blog_posts) para listar entradas por marca.',
        })
      }
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ posts: data ?? [] })
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
      if (error.message?.includes('brand_id') || error.code === '42703') {
        const { data: d2, error: e2 } = await supabaseServer
          .from('blog_posts')
          .insert({
            title_es: title,
            title_en: title,
            slug: unique,
            content_es: content,
            content_en: content,
            cover_image: body.coverImage ?? null,
            category: body.category?.trim() || 'wellness',
            author: session.seller.brandName,
            published_at: new Date().toISOString(),
          })
          .select('id, slug')
          .single()
        if (e2) {
          console.error(e2)
          return NextResponse.json({ error: e2.message }, { status: 500 })
        }
        return NextResponse.json({ ok: true, id: d2?.id, slug: d2?.slug })
      }
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data?.id, slug: data?.slug })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
