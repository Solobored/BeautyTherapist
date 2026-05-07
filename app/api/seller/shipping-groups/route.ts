import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SHIPPING_GROUP_SELECT = `
  id,
  seller_id,
  name,
  carrier,
  rate_rm,
  rate_sur,
  rate_norte,
  rate_extremo,
  rate_prioritario,
  free_shipping_threshold,
  eta_rm,
  eta_sur,
  eta_norte,
  eta_extremo,
  notes,
  active,
  created_at,
  updated_at,
  product_shipping_groups (
    product_id,
    products (
      id,
      name_es,
      name_en
    )
  )
`

function normalizeGroup(group: Record<string, unknown>) {
  const assignments = Array.isArray(group.product_shipping_groups)
    ? group.product_shipping_groups
    : []

  return {
    ...group,
    products: assignments
      .map((item) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products
        return product
          ? {
              id: product.id,
              name: product.name_es || product.name_en,
            }
          : null
      })
      .filter(Boolean),
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const { data, error } = await supabaseServer
      .from('shipping_groups')
      .select(SHIPPING_GROUP_SELECT)
      .eq('seller_id', session.sellerId)
      .order('created_at', { ascending: false })

    if (error) {
      if (
        error.code === '42P01' ||
        String(error.message ?? '').toLowerCase().includes('shipping_groups')
      ) {
        return NextResponse.json({
          groups: [],
          notice: 'Activa primero las migraciones de envios para usar grupos personalizados.',
        })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ groups: (data ?? []).map((group) => normalizeGroup(group)) })
  } catch (error) {
    console.error('shipping-groups GET', error)
    return NextResponse.json({ error: 'Error al cargar grupos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const body = (await request.json()) as Record<string, unknown>

    const { data, error } = await supabaseServer
      .from('shipping_groups')
      .insert({
        seller_id: session.sellerId,
        name: String(body.name ?? '').trim(),
        carrier:
          body.carrier === 'blue_express' || body.carrier === 'chile_express'
            ? body.carrier
            : 'custom',
        rate_rm: body.rate_rm ?? null,
        rate_sur: body.rate_sur ?? null,
        rate_norte: body.rate_norte ?? null,
        rate_extremo: body.rate_extremo ?? null,
        rate_prioritario: body.rate_prioritario ?? null,
        free_shipping_threshold: body.free_shipping_threshold ?? null,
        eta_rm: body.eta_rm ?? '1-2 dias habiles',
        eta_sur: body.eta_sur ?? '3-5 dias habiles',
        eta_norte: body.eta_norte ?? '4-6 dias habiles',
        eta_extremo: body.eta_extremo ?? '8-12 dias habiles',
        notes: body.notes ?? null,
        active: body.active ?? true,
      })
      .select(SHIPPING_GROUP_SELECT)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ group: normalizeGroup(data as Record<string, unknown>) })
  } catch (error) {
    console.error('shipping-groups POST', error)
    return NextResponse.json({ error: 'Error al crear grupo' }, { status: 500 })
  }
}
