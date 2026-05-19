import { supabaseServer } from '@/lib/supabase'

export type CouponBenefitType = 'percentage' | 'fixed' | 'free_shipping'
export type CouponRedemptionStatus = 'reserved' | 'used' | 'released'

type CouponRow = {
  id: string
  brand_id: string
  code: string
  title: string | null
  description: string | null
  discount_type: CouponBenefitType
  discount_value: number
  min_order: number | null
  max_uses: number | null
  used_count: number
  per_user_limit: number
  expires_at: string | null
  is_active: boolean
  created_at: string
  brands?: {
    brand_name?: string | null
  } | null
}

export type CheckoutCoupon = {
  id: string
  brandId: string
  brandName: string | null
  code: string
  title: string
  description: string | null
  type: CouponBenefitType
  value: number
  minOrder: number | null
  maxUses: number | null
  usedCount: number
  perUserLimit: number
  expiresAt: string | null
  isActive: boolean
}

export type CouponValidationResult =
  | {
      ok: true
      coupon: CheckoutCoupon
      discountAmount: number
    }
  | {
      ok: false
      error: string
      status?: number
    }

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase()
}

function mapCoupon(row: CouponRow): CheckoutCoupon {
  return {
    id: row.id,
    brandId: row.brand_id,
    brandName: row.brands?.brand_name ?? null,
    code: row.code,
    title: row.title?.trim() || row.code,
    description: row.description ?? null,
    type: row.discount_type,
    value: Number(row.discount_value ?? 0),
    minOrder: row.min_order == null ? null : Number(row.min_order),
    maxUses: row.max_uses == null ? null : Number(row.max_uses),
    usedCount: Number(row.used_count ?? 0),
    perUserLimit: Math.max(1, Number(row.per_user_limit ?? 1)),
    expiresAt: row.expires_at ?? null,
    isActive: Boolean(row.is_active),
  }
}

export function calculateCouponDiscount(params: {
  subtotal: number
  shippingCost: number
  coupon: Pick<CheckoutCoupon, 'type' | 'value'>
}) {
  const subtotal = Math.max(0, Math.round(params.subtotal))
  const shippingCost = Math.max(0, Math.round(params.shippingCost))

  if (params.coupon.type === 'free_shipping') {
    return shippingCost
  }

  if (params.coupon.type === 'percentage') {
    return Math.min(subtotal, Math.round((subtotal * params.coupon.value) / 100))
  }

  return Math.min(subtotal, Math.max(0, Math.round(params.coupon.value)))
}

async function countCouponUses(couponId: string) {
  const { count, error } = await supabaseServer
    .from('coupon_redemptions')
    .select('id', { count: 'exact', head: true })
    .eq('coupon_id', couponId)
    .in('status', ['reserved', 'used'])

  if (error) {
    throw new Error('No se pudo validar la disponibilidad del cupón.')
  }

  return Number(count ?? 0)
}

async function countCustomerUses(couponId: string, buyerEmail: string, userId?: string | null) {
  const normalizedEmail = normalizeEmail(buyerEmail)
  let total = 0

  if (userId) {
    const { count, error } = await supabaseServer
      .from('coupon_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', couponId)
      .eq('user_id', userId)
      .in('status', ['reserved', 'used'])

    if (error) {
      throw new Error('No se pudo validar el uso del cupón para este usuario.')
    }

    total += Number(count ?? 0)
  }

  const { count, error } = await supabaseServer
    .from('coupon_redemptions')
    .select('id', { count: 'exact', head: true })
    .eq('coupon_id', couponId)
    .eq('buyer_email', normalizedEmail)
    .in('status', ['reserved', 'used'])

  if (error) {
    throw new Error('No se pudo validar el uso del cupón para este correo.')
  }

  total += Number(count ?? 0)
  return total
}

async function loadCartBrandIds(productIds: string[]) {
  const uniqueProductIds = Array.from(new Set(productIds.filter(Boolean)))
  if (uniqueProductIds.length === 0) return []

  const { data, error } = await supabaseServer
    .from('products')
    .select('id, brand_id')
    .in('id', uniqueProductIds)

  if (error) {
    throw new Error('No se pudieron validar los productos del carrito para aplicar el cupón.')
  }

  return (data ?? []).map((product) => ({
    productId: String(product.id),
    brandId: String(product.brand_id),
  }))
}

export async function validateCouponForCheckout(params: {
  code: string
  subtotal: number
  shippingCost: number
  buyerEmail: string
  userId?: string | null
  productIds: string[]
}): Promise<CouponValidationResult> {
  const code = normalizeCouponCode(params.code)
  const buyerEmail = normalizeEmail(params.buyerEmail)

  if (!code) {
    return { ok: false, error: 'Ingresa un código de cupón.', status: 400 }
  }

  if (!buyerEmail) {
    return { ok: false, error: 'Ingresa tu correo antes de aplicar un cupón.', status: 400 }
  }

  const { data, error } = await supabaseServer
    .from('coupons')
    .select(
      `
      id,
      brand_id,
      code,
      title,
      description,
      discount_type,
      discount_value,
      min_order,
      max_uses,
      used_count,
      per_user_limit,
      expires_at,
      is_active,
      created_at,
      brands (
        brand_name
      )
    `
    )
    .eq('code', code)
    .maybeSingle()

  if (error) {
    return { ok: false, error: 'No se pudo validar el cupón.', status: 500 }
  }

  if (!data) {
    return { ok: false, error: 'Cupón inválido o inexistente.', status: 404 }
  }

  const coupon = mapCoupon(data as CouponRow)

  if (!coupon.isActive) {
    return { ok: false, error: 'Este cupón no está activo.', status: 400 }
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= Date.now()) {
    return { ok: false, error: 'Este cupón ya expiró.', status: 400 }
  }

  if (coupon.minOrder != null && Math.round(params.subtotal) < Math.round(coupon.minOrder)) {
    return {
      ok: false,
      error: `Este cupón requiere una compra mínima de $${Math.round(coupon.minOrder)}.`,
      status: 400,
    }
  }

  try {
    const cartProducts = await loadCartBrandIds(params.productIds)
    if (cartProducts.length === 0) {
      return { ok: false, error: 'No hay productos válidos para aplicar el cupón.', status: 400 }
    }

    const invalidProduct = cartProducts.find((product) => product.brandId !== coupon.brandId)
    if (invalidProduct) {
      return {
        ok: false,
        error: coupon.brandName
          ? `Este cupón solo aplica a productos de ${coupon.brandName}.`
          : 'Este cupón solo aplica a productos del vendedor que lo creó.',
        status: 400,
      }
    }

    const totalUses = await countCouponUses(coupon.id)
    if (coupon.maxUses != null && totalUses >= coupon.maxUses) {
      return { ok: false, error: 'Este cupón ya alcanzó su límite de usos.', status: 400 }
    }

    const customerUses = await countCustomerUses(coupon.id, buyerEmail, params.userId)
    if (customerUses >= coupon.perUserLimit) {
      return { ok: false, error: 'Ya usaste este cupón anteriormente.', status: 400 }
    }

    return {
      ok: true,
      coupon,
      discountAmount: calculateCouponDiscount({
        subtotal: params.subtotal,
        shippingCost: params.shippingCost,
        coupon,
      }),
    }
  } catch (validationError) {
    return {
      ok: false,
      error:
        validationError instanceof Error
          ? validationError.message
          : 'No se pudo validar el cupón en este momento.',
      status: 500,
    }
  }
}

export async function reserveCouponRedemptionForOrder(params: {
  couponId: string
  orderId: string
  buyerEmail: string
  userId?: string | null
}) {
  const buyerEmail = normalizeEmail(params.buyerEmail)

  const { data: existing } = await supabaseServer
    .from('coupon_redemptions')
    .select('id, status')
    .eq('order_id', params.orderId)
    .maybeSingle()

  if (existing?.id) {
    return { ok: true as const }
  }

  const { error } = await supabaseServer.from('coupon_redemptions').insert({
    coupon_id: params.couponId,
    order_id: params.orderId,
    user_id: params.userId ?? null,
    buyer_email: buyerEmail,
    status: 'reserved',
    reserved_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) {
    if (error.code === '23505') {
      return { ok: false as const, error: 'Este cupón ya fue reservado para este usuario.' }
    }
    return { ok: false as const, error: 'No se pudo reservar el cupón para este pedido.' }
  }

  return { ok: true as const }
}

export async function finalizeCouponRedemptionForOrder(orderId: string) {
  const now = new Date().toISOString()
  const { data, error } = await supabaseServer
    .from('coupon_redemptions')
    .update({
      status: 'used',
      used_at: now,
      updated_at: now,
    })
    .eq('order_id', orderId)
    .eq('status', 'reserved')
    .select('coupon_id')

  if (error) {
    console.error('finalizeCouponRedemptionForOrder', error)
    return
  }

  const increments = new Map<string, number>()
  for (const row of data ?? []) {
    const couponId = String(row.coupon_id)
    increments.set(couponId, (increments.get(couponId) ?? 0) + 1)
  }

  for (const [couponId, incrementBy] of increments) {
    const { data: coupon, error: couponError } = await supabaseServer
      .from('coupons')
      .select('used_count')
      .eq('id', couponId)
      .maybeSingle()

    if (couponError || !coupon) {
      console.error('finalizeCouponRedemptionForOrder coupon', couponError)
      continue
    }

    await supabaseServer
      .from('coupons')
      .update({
        used_count: Number(coupon.used_count ?? 0) + incrementBy,
      })
      .eq('id', couponId)
  }
}

export async function releaseCouponRedemptionForOrder(orderId: string) {
  const now = new Date().toISOString()
  const { error } = await supabaseServer
    .from('coupon_redemptions')
    .update({
      status: 'released',
      released_at: now,
      updated_at: now,
    })
    .eq('order_id', orderId)
    .eq('status', 'reserved')

  if (error) {
    console.error('releaseCouponRedemptionForOrder', error)
  }
}
