import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { normalizeCouponCode } from '@/lib/coupons'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSellerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
  }

  const { data: coupons, error } = await supabaseServer
    .from('coupons')
    .select(
      'id, code, title, description, discount_type, discount_value, min_order, max_uses, used_count, per_user_limit, expires_at, is_active, created_at'
    )
    .eq('brand_id', session.brandId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('seller coupons get', error)
    return NextResponse.json({ error: 'No se pudieron cargar los cupones.' }, { status: 500 })
  }

  const couponIds = (coupons ?? []).map((coupon) => coupon.id)
  let redemptionStats = new Map<string, { reserved: number; used: number }>()

  if (couponIds.length > 0) {
    const { data: redemptions, error: redemptionError } = await supabaseServer
      .from('coupon_redemptions')
      .select('coupon_id, status')
      .in('coupon_id', couponIds)

    if (redemptionError) {
      console.error('seller coupons redemptions', redemptionError)
    } else {
      for (const row of redemptions ?? []) {
        const couponId = String(row.coupon_id)
        const current = redemptionStats.get(couponId) ?? { reserved: 0, used: 0 }
        if (row.status === 'reserved') current.reserved += 1
        if (row.status === 'used') current.used += 1
        redemptionStats.set(couponId, current)
      }
    }
  }

  return NextResponse.json({
    coupons: (coupons ?? []).map((coupon) => {
      const stats = redemptionStats.get(coupon.id) ?? { reserved: 0, used: 0 }
      return {
        id: coupon.id,
        code: coupon.code,
        title: coupon.title ?? coupon.code,
        description: coupon.description ?? null,
        type: coupon.discount_type,
        value: Number(coupon.discount_value ?? 0),
        minOrder: coupon.min_order == null ? null : Number(coupon.min_order),
        maxUses: coupon.max_uses == null ? null : Number(coupon.max_uses),
        usedCount: Number(coupon.used_count ?? 0),
        reservedCount: stats.reserved,
        perUserLimit: Number(coupon.per_user_limit ?? 1),
        expiresAt: coupon.expires_at,
        isActive: Boolean(coupon.is_active),
        createdAt: coupon.created_at,
      }
    }),
  })
}

export async function POST(request: NextRequest) {
  const session = await getSellerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    code?: string
    title?: string
    description?: string
    type?: 'percentage' | 'fixed' | 'free_shipping'
    value?: number
    minOrder?: number | null
    maxUses?: number | null
    expiresAt?: string | null
  }

  const code = normalizeCouponCode(body.code ?? '')
  const title = String(body.title ?? '').trim()
  const description = String(body.description ?? '').trim()
  const type = body.type === 'fixed' || body.type === 'free_shipping' ? body.type : 'percentage'
  const value = type === 'free_shipping' ? 0 : Number(body.value ?? 0)
  const minOrder = body.minOrder == null || body.minOrder === 0 ? null : Number(body.minOrder)
  const maxUses = body.maxUses == null ? null : Number(body.maxUses)
  const expiresAt = body.expiresAt?.trim() ? new Date(body.expiresAt).toISOString() : null

  if (!code || code.length < 4) {
    return NextResponse.json({ error: 'El código debe tener al menos 4 caracteres.' }, { status: 400 })
  }

  if (!title) {
    return NextResponse.json({ error: 'Ingresa un nombre para el cupón.' }, { status: 400 })
  }

  if (type !== 'free_shipping' && (!Number.isFinite(value) || value <= 0)) {
    return NextResponse.json({ error: 'Ingresa un descuento válido.' }, { status: 400 })
  }

  if (type === 'percentage' && value > 100) {
    return NextResponse.json({ error: 'El descuento porcentual no puede superar 100%.' }, { status: 400 })
  }

  if (maxUses != null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    return NextResponse.json({ error: 'La cantidad de usos debe ser un entero mayor a 0.' }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from('coupons')
    .insert({
      brand_id: session.brandId,
      code,
      title,
      description: description || null,
      discount_type: type,
      discount_value: value,
      min_order: minOrder,
      max_uses: maxUses,
      per_user_limit: 1,
      expires_at: expiresAt,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) {
    console.error('seller coupons post', error)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe un cupón con ese código.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'No se pudo crear el cupón.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, couponId: data.id })
}
