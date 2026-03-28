import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Elimina pedidos cancelados con antigüedad ≥ 7 días (libera espacio). Proteger con CRON_SECRET. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 503 })
  }
  const auth = request.headers.get('authorization')?.trim() ?? ''
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabaseServer
    .from('orders')
    .delete()
    .eq('order_status', 'cancelled')
    .lt('updated_at', cutoff)
    .select('id')

  if (error) {
    console.error('purge cancelled orders', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const n = data?.length ?? 0
  return NextResponse.json({ ok: true, deleted: n })
}
