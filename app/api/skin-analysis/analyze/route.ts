import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { checkRateLimit, clientIp } from '@/lib/rate-limit-ip'
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

const SYSTEM_PROMPT = `
Analiza una descripcion o foto para orientar recomendaciones cosmeticas; no diagnostiques enfermedades.
Usa solo skin_type: seca|grasa|mixta|normal|sensible; concerns: rosacea|acne|manchas|deshidratacion|poros_dilatados; goals: hidratar|reducir_brillo|antiedad|calmar_rojeces.
Elige solo categorias respaldadas por la entrada. Escribe observations en el idioma del usuario, breve y concreta, sin diagnosticos.
Responde solo JSON: {"skin_type":"...","concerns":[],"goals":[],"observations":"..."}
`

const unavailableMessage = 'Maien no está disponible en este momento, intenta el formulario rápido.'

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  const limit = checkRateLimit(`skin-analysis-ai:${ip}`, 5, 60_000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } },
    )
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }
  const sessionToken = body.sessionToken
  if (!isSkinSessionToken(sessionToken)) {
    return NextResponse.json({ error: 'Sesión de análisis inválida' }, { status: 400 })
  }
  if (body.privacyConsent !== true) {
    return NextResponse.json({ error: 'Debes aceptar el aviso de privacidad' }, { status: 400 })
  }

  const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : ''
  const textDescription = typeof body.textDescription === 'string' ? body.textDescription.trim() : ''
  if (Boolean(imageBase64) === Boolean(textDescription)) {
    return NextResponse.json({ error: 'Envía una foto o una descripción, no ambas' }, { status: 400 })
  }
  if (textDescription && textDescription.length > 1200) {
    return NextResponse.json({ error: 'La descripción no puede superar 1200 caracteres' }, { status: 400 })
  }

  const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'image/jpeg'
  if (imageBase64 && (!allowedImageTypes.has(mimeType) || imageBase64.length > 7_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64))) {
    return NextResponse.json({ error: 'La foto debe ser JPG, PNG o WebP y pesar hasta 5 MB' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return NextResponse.json({ error: unavailableMessage }, { status: 503 })

  let parsed: unknown
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite',
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 256, temperature: 0.2 },
    })
    const inputPart = imageBase64
      ? { inlineData: { mimeType, data: imageBase64 } }
      : { text: `Descripcion del usuario: "${textDescription}"` }
    const result = await model.generateContent([{ text: SYSTEM_PROMPT }, inputPart])
    parsed = JSON.parse(result.response.text())
  } catch (error) {
    console.error('skin-analysis Gemini request failed', error)
    return NextResponse.json({ error: unavailableMessage }, { status: 503 })
  }

  if (!parsed || typeof parsed !== 'object') {
    return NextResponse.json({ error: 'La IA no devolvió JSON válido' }, { status: 502 })
  }
  const result = parsed as Record<string, unknown>
  const skinType = result.skin_type
  const concerns = normalizeAllowedValues(result.concerns, SKIN_CONCERNS)
  const goals = normalizeAllowedValues(result.goals, SKIN_GOALS)
  const observations = typeof result.observations === 'string' ? result.observations.trim().slice(0, 600) : ''
  if (!SKIN_TYPES.includes(skinType as SkinType) || !concerns || !goals || !observations) {
    return NextResponse.json({ error: 'La IA no devolvió un análisis válido' }, { status: 502 })
  }

  const { id, error } = await saveSkinAnalysis({
    sessionToken,
    source: imageBase64 ? 'ai_photo' : 'ai_text',
    skinType: skinType as SkinType,
    concerns,
    goals,
    aiObservations: observations,
  })
  if (error || !id) {
    console.error('skin-analysis Gemini save failed', error)
    if (error?.code === 'PGRST205' || error?.code === 'PGRST204') {
      return NextResponse.json(
        { error: 'Gemini respondió, pero falta aplicar la migración de análisis de piel en Supabase.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: 'No se pudo guardar el análisis' }, { status: 500 })
  }

  return NextResponse.json({
    analysisId: id,
    suggested: { skin_type: skinType, concerns, goals },
    observations,
    disclaimer: 'Esto es una observación generada por IA, no un diagnóstico médico. Consulta a un dermatólogo para un diagnóstico real.',
  })
}