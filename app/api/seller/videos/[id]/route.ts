import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function ownVideo(id: string, sellerId: string) {
  const { data } = await supabaseServer
    .from('seller_videos')
    .select('*')
    .eq('id', id)
    .eq('seller_id', sellerId)
    .maybeSingle()

  return data
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const { id } = await context.params
    const current = await ownVideo(id, session.sellerId)
    if (!current) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const { error } = await supabaseServer
      .from('seller_videos')
      .update({
        title: String(body.title ?? current.title).trim(),
        description: typeof body.description === 'string' ? body.description.trim() : current.description,
        cloudinary_url:
          typeof body.cloudinaryUrl === 'string' ? body.cloudinaryUrl.trim() : current.cloudinary_url,
        cloudinary_public_id:
          typeof body.cloudinaryPublicId === 'string'
            ? body.cloudinaryPublicId.trim()
            : current.cloudinary_public_id,
        thumbnail_url:
          typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl.trim() : current.thumbnail_url,
        featured_product_ids: Array.isArray(body.featuredProductIds)
          ? body.featuredProductIds.slice(0, 3)
          : current.featured_product_ids,
        duration_seconds:
          typeof body.durationSeconds === 'number' ? body.durationSeconds : current.duration_seconds,
        active: typeof body.active === 'boolean' ? body.active : current.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('seller videos PUT', error)
    return NextResponse.json({ error: 'Error al actualizar video' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const { id } = await context.params
    const current = await ownVideo(id, session.sellerId)
    if (!current) {
      return NextResponse.json({ error: 'Video no encontrado' }, { status: 404 })
    }

    await cloudinary.uploader.destroy(current.cloudinary_public_id, {
      resource_type: 'video',
    }).catch((error) => {
      console.error('cloudinary destroy video', error)
    })

    const { error } = await supabaseServer.from('seller_videos').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('seller videos DELETE', error)
    return NextResponse.json({ error: 'Error al eliminar video' }, { status: 500 })
  }
}
