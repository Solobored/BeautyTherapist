import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { fetchPublicVideos } from '@/lib/videos'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? '10'), 1), 20)
    const videos = await fetchPublicVideos(limit)

    return NextResponse.json({
      videos,
      nextCursor: null,
    })
  } catch (error) {
    console.error('api/videos GET', error)
    return NextResponse.json({ videos: [], nextCursor: null })
  }
}
