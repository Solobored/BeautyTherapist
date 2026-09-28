import { NextRequest, NextResponse } from 'next/server'
import { saveSkinAnalysis } from '@/lib/skin-analysis-store'
import {
  isSkinSessionToken,
  normalizeAllowedValues,
  SKIN_CONCERNS,
  SKIN_GOALS,
  SKIN_TYPES,
} from '@/lib/skin-analysis'
import type { SkinType } from '@/types/skin-analysis'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
    }

    const sessionToken = body.sessionToken ?? body.session_token
    if (!isSkinSessionToken(sessionToken)) {
      return NextResponse.json({ error: 'Sesión de análisis inválida' }, { status: 400 })
    }
    if (body.privacyConsent !== true) {
      return NextResponse.json({ error: 'Debes aceptar el aviso de privacidad' }, { status: 400 })
    }

    const skinType = body.skinType ?? body.skin_type ?? null
    if (skinType !== null && !SKIN_TYPES.includes(skinType as SkinType)) {
      return NextResponse.json({ error: 'Tipo de piel inválido' }, { status: 400 })
    }
    const concerns = normalizeAllowedValues(body.concerns ?? [], SKIN_CONCERNS)
    const goals = normalizeAllowedValues(body.goals ?? [], SKIN_GOALS)
    if (!concerns || !goals) {
      return NextResponse.json({ error: 'Preocupaciones u objetivos inválidos' }, { status: 400 })
    }

    const notes = body.notes == null ? null : String(body.notes).trim()
    if (notes && notes.length > 2000) {
      return NextResponse.json({ error: 'Las notas no pueden superar 2000 caracteres' }, { status: 400 })
    }

    const { id, error } = await saveSkinAnalysis({
      sessionToken,
      source: 'form',
      skinType: skinType as SkinType | null,
      concerns,
      goals,
      notes,
    })
    if (error || !id) {
      console.error('skin-analysis POST', error)
      if (error?.code === 'PGRST205' || error?.code === 'PGRST204') {
        return NextResponse.json(
          { error: 'Falta aplicar la migración de análisis de piel en Supabase.' },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: 'No se pudo guardar el análisis' }, { status: 500 })
    }

    return NextResponse.json({ analysisId: id }, { status: 201 })
  } catch (error) {
    console.error('skin-analysis POST', error)
    return NextResponse.json({ error: 'No se pudo guardar el análisis' }, { status: 500 })
  }
}