import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const RIGHT_TYPES = ['acceso', 'rectificacion', 'cancelacion', 'oposicion', 'portabilidad', 'bloqueo'] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, rightType, details } = body

    if (!fullName || !email || !RIGHT_TYPES.includes(rightType)) {
      return NextResponse.json({ error: 'Datos incompletos o inválidos' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('data_rights_requests').insert({
      full_name: fullName,
      email,
      right_type: rightType,
      details: details ?? null,
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('data-rights request error', err)
    return NextResponse.json({ error: 'No pudimos procesar tu solicitud. Intenta nuevamente.' }, { status: 500 })
  }
}
