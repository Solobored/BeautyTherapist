import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const session = await getSellerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
  }

  const { data, error } = await supabaseServer
    .from('skin_tags')
    .select('id, slug, label_es, label_en, category')
    .order('category', { ascending: true })
    .order('label_es', { ascending: true })

  if (error) {
    console.error('seller skin-tags GET', error)
    return NextResponse.json({ error: 'No se pudieron cargar las etiquetas' }, { status: 500 })
  }

  return NextResponse.json({ tags: data ?? [] })
}