import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { data, error } = await supabaseServer.rpc('increment_video_views', { p_video_id: id })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, viewsCount: data })
  } catch (error) {
    console.error('api/videos/[id]/view POST', error)
    return NextResponse.json({ error: 'Error al registrar vista' }, { status: 500 })
  }
}
