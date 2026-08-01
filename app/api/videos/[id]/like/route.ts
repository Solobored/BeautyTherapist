import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = (await request.json().catch(() => ({}))) as { liked?: boolean }
    const delta = body.liked ? 1 : -1

    const { data, error } = await supabaseServer.rpc('adjust_video_likes', {
      p_video_id: id,
      p_delta: delta,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, likesCount: data, liked: Boolean(body.liked) })
  } catch (error) {
    console.error('api/videos/[id]/like POST', error)
    return NextResponse.json({ error: 'Error al actualizar likes' }, { status: 500 })
  }
}
