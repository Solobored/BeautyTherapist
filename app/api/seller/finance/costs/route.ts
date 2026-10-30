import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * PUT { costs: { [productId]: number | null } }
 * Guarda el costo unitario (products.cost_price) solo de productos que pertenecen a la marca de la sesión.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
    }

    const body = (await request.json().catch(() => null)) as { costs?: Record<string, unknown> } | null
    const entries = Object.entries(body?.costs ?? {})
    if (entries.length === 0 || entries.length > 500) {
      return NextResponse.json({ error: 'Costos inválidos.' }, { status: 400 })
    }

    const parsed: { id: string; cost: number | null }[] = []
    for (const [id, raw] of entries) {
      if (raw === null || raw === '') {
        parsed.push({ id, cost: null })
        continue
      }
      const n = Number(raw)
      if (!Number.isFinite(n) || n < 0 || n > 100_000_000) {
        return NextResponse.json({ error: `Costo inválido para ${id}.` }, { status: 400 })
      }
      parsed.push({ id, cost: Math.round(n * 100) / 100 })
    }

    const { data: owned, error: ownErr } = await supabaseServer
      .from('products')
      .select('id')
      .eq('brand_id', session.brandId)
      .in('id', parsed.map((p) => p.id))
    if (ownErr) return NextResponse.json({ error: ownErr.message }, { status: 500 })

    const ownedIds = new Set((owned ?? []).map((p) => p.id))
    const allowed = parsed.filter((p) => ownedIds.has(p.id))

    for (const { id, cost } of allowed) {
      const { error } = await supabaseServer
        .from('products')
        .update({ cost_price: cost })
        .eq('id', id)
        .eq('brand_id', session.brandId)
      if (error) {
        const hint = /cost_price/.test(error.message)
          ? 'Falta aplicar la migración 20261029000000_product_cost_price.sql en Supabase.'
          : error.message
        return NextResponse.json({ error: hint }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, updated: allowed.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
