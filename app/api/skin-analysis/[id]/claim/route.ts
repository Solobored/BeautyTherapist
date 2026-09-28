import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { isSkinSessionToken } from '@/lib/skin-analysis'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
  if (!accessToken) {
    return NextResponse.json({ error: 'Inicia sesión para guardar este análisis' }, { status: 401 })
  }

  try {
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })
    const authUser = authResponse.ok ? await authResponse.json() : null
    if (!authUser?.id || typeof authUser.id !== 'string') {
      return NextResponse.json({ error: 'Sesión de usuario inválida' }, { status: 401 })
    }
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('id, user_type')
      .eq('id', authUser.id)
      .maybeSingle()
    if (profileError) {
      return NextResponse.json({ error: 'No se pudo verificar el perfil' }, { status: 500 })
    }
    if (!profile || profile.user_type !== 'buyer') {
      return NextResponse.json({ error: 'No se encontró un perfil de comprador para esta sesión' }, { status: 409 })
    }

    const body = await request.json().catch(() => ({}))
    if (!isSkinSessionToken(body.sessionToken)) {
      return NextResponse.json({ error: 'Sesión de análisis inválida' }, { status: 400 })
    }

    const { id } = await context.params
    const { data: analysis, error: lookupError } = await supabaseServer
      .from('skin_analyses')
      .select('id, user_id')
      .eq('id', id)
      .eq('session_token', body.sessionToken)
      .maybeSingle()

    if (lookupError) {
      return NextResponse.json({ error: 'No se pudo asociar el análisis' }, { status: 500 })
    }
    if (!analysis) return NextResponse.json({ error: 'Análisis no encontrado' }, { status: 404 })
    if (analysis.user_id && analysis.user_id !== authUser.id) {
      return NextResponse.json({ error: 'El análisis ya pertenece a otra cuenta' }, { status: 409 })
    }

    const { error } = await supabaseServer
      .from('skin_analyses')
      .update({ user_id: authUser.id, saved: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('session_token', body.sessionToken)
    if (error) {
      console.error('skin-analysis claim', error)
      return NextResponse.json({ error: 'No se pudo guardar el análisis' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('skin-analysis claim', error)
    return NextResponse.json({ error: 'No se pudo asociar el análisis' }, { status: 500 })
  }
}