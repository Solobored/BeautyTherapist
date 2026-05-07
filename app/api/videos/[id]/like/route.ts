import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = (await request.json().catch(() => ({}))) as { liked?: boolean }

    const { data: current } = await supabaseServer
      .from('seller_videos')
      .select('likes_count')
      .eq('id', id)
      .maybeSingle()

    const currentLikes = Number(current?.likes_count ?? 0)
    const nextLikes = body.liked ? currentLikes + 1 : Math.max(0, currentLikes - 1)

    const { error } = await supabaseServer
      .from('seller_videos')
      .update({ likes_count: nextLikes, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, likesCount: nextLikes, liked: Boolean(body.liked) })
  } catch (error) {
    console.error('api/videos/[id]/like POST', error)
    return NextResponse.json({ error: 'Error al actualizar likes' }, { status: 500 })
  }
}
