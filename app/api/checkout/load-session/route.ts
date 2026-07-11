import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('shared_checkout_sessions')
      .select('session_data, expires_at')
      .eq('token', token)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Sesión no encontrada o expirada' },
        { status: 404 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // Check if session is expired
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'La sesión de compra ha expirado' },
        { status: 410 }
      )
    }

    // Update access count and last accessed time
    await supabaseServer
      .from('shared_checkout_sessions')
      .update({
        accessed_count: data.accessed_count + 1 || 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('token', token)

    return NextResponse.json(data.session_data, { status: 200 })
  } catch (e) {
    console.error('Error loading shared checkout session:', e)
    return NextResponse.json(
      { error: 'Error al cargar la sesión' },
      { status: 500 }
    )
  }
}
