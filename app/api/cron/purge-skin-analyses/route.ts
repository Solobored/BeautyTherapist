import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { supabaseServer } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 503 })
  if (request.headers.get('authorization')?.trim() !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: expired, error: lookupError } = await supabaseServer
    .from('skin_analyses')
    .select('id, report_file_public_id, report_file_type')
    .is('user_id', null)
    .lt('expires_at', new Date().toISOString())
    .limit(200)
  if (lookupError) {
    console.error('purge expired skin analyses lookup', lookupError)
    return NextResponse.json({ error: 'No se pudieron cargar análisis vencidos' }, { status: 500 })
  }

  for (const analysis of expired ?? []) {
    if (!analysis.report_file_public_id) continue
    const result = await cloudinary.uploader.destroy(analysis.report_file_public_id, {
      resource_type: analysis.report_file_type === 'pdf' ? 'raw' : 'image',
    })
    if (result.result !== 'ok' && result.result !== 'not found') {
      return NextResponse.json({ error: 'No se pudo eliminar un archivo de informe vencido' }, { status: 503 })
    }
  }

  const ids = (expired ?? []).map((analysis) => analysis.id)
  if (ids.length === 0) return NextResponse.json({ ok: true, deleted: 0 })
  const { data, error } = await supabaseServer
    .from('skin_analyses')
    .delete()
    .in('id', ids)
    .select('id')
  if (error) {
    console.error('purge expired skin analyses delete', error)
    return NextResponse.json({ error: 'No se pudieron eliminar análisis vencidos' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, deleted: data?.length ?? 0 })
}
