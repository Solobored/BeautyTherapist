import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const { data, error } = await supabaseServer
      .from('seller_videos')
      .select('*')
      .eq('seller_id', session.sellerId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ videos: data ?? [] })
  } catch (error) {
    console.error('seller videos GET', error)
    return NextResponse.json({ error: 'Error al cargar videos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const body = (await request.json()) as {
      title?: string
      description?: string
      cloudinaryUrl?: string
      cloudinaryPublicId?: string
      thumbnailUrl?: string
      featuredProductIds?: string[]
      durationSeconds?: number
      active?: boolean
    }

    const { data, error } = await supabaseServer
      .from('seller_videos')
      .insert({
        seller_id: session.sellerId,
        brand_id: session.brandId,
        title: body.title?.trim(),
        description: body.description?.trim() || null,
        cloudinary_url: body.cloudinaryUrl?.trim(),
        cloudinary_public_id: body.cloudinaryPublicId?.trim(),
        thumbnail_url: body.thumbnailUrl?.trim() || null,
        featured_product_ids: (body.featuredProductIds ?? []).slice(0, 3),
        duration_seconds: body.durationSeconds ?? null,
        active: body.active ?? true,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ video: data })
  } catch (error) {
    console.error('seller videos POST', error)
    return NextResponse.json({ error: 'Error al guardar video' }, { status: 500 })
  }
}
