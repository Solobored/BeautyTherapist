import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { isSkinSessionToken } from '@/lib/skin-analysis'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const sessionToken =
      request.nextUrl.searchParams.get('sessionToken') ?? request.headers.get('x-skin-session')
    if (!isSkinSessionToken(sessionToken)) {
      return NextResponse.json({ error: 'Sesión de análisis requerida' }, { status: 401 })
    }

    const { data, error } = await supabaseServer
      .from('skin_analyses')
      .select('id, user_id, skin_type, concerns, goals, notes, report_file_url, report_file_type, source, ai_observations, created_at, expires_at')
      .eq('id', id)
      .eq('session_token', sessionToken)
      .maybeSingle()

    if (error) {
      console.error('skin-analysis GET', error)
      return NextResponse.json({ error: 'No se pudo cargar el análisis' }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: 'Análisis no encontrado' }, { status: 404 })
    if (!data.user_id && Date.parse(data.expires_at) <= Date.now()) {
      return NextResponse.json({ error: 'Este análisis ha vencido' }, { status: 410 })
    }

    const { user_id: _userId, expires_at: _expiresAt, ...analysis } = data
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('skin-analysis GET', error)
    return NextResponse.json({ error: 'No se pudo cargar el análisis' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const sessionToken = request.headers.get('x-skin-session')
    if (!isSkinSessionToken(sessionToken)) {
      return NextResponse.json({ error: 'Sesión de análisis requerida' }, { status: 401 })
    }
    const { data: analysis, error: lookupError } = await supabaseServer
      .from('skin_analyses')
      .select('id, report_file_public_id, report_file_type')
      .eq('id', id)
      .eq('session_token', sessionToken)
      .maybeSingle()
    if (lookupError) throw lookupError
    if (!analysis) return NextResponse.json({ error: 'Análisis no encontrado' }, { status: 404 })

    if (analysis.report_file_public_id) {
      const { v2: cloudinary } = await import('cloudinary')
      cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
      const result = await cloudinary.uploader.destroy(analysis.report_file_public_id, {
        resource_type: analysis.report_file_type === 'pdf' ? 'raw' : 'image',
      })
      if (result.result !== 'ok' && result.result !== 'not found') {
        return NextResponse.json({ error: 'No se pudo eliminar el archivo del informe' }, { status: 503 })
      }
    }

    const { error } = await supabaseServer
      .from('skin_analyses')
      .delete()
      .eq('id', id)
      .eq('session_token', sessionToken)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('skin-analysis DELETE', error)
    return NextResponse.json({ error: 'No se pudo eliminar el análisis' }, { status: 500 })
  }
}