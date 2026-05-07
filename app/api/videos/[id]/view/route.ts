import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { data: current } = await supabaseServer
      .from('seller_videos')
      .select('views_count')
      .eq('id', id)
      .maybeSingle()

    const nextViews = Number(current?.views_count ?? 0) + 1
    const { error } = await supabaseServer
      .from('seller_videos')
      .update({ views_count: nextViews, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, viewsCount: nextViews })
  } catch (error) {
    console.error('api/videos/[id]/view POST', error)
    return NextResponse.json({ error: 'Error al registrar vista' }, { status: 500 })
  }
}
