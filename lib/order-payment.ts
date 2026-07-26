import { supabaseServer } from '@/lib/supabase'
import { decrementStockForOrderLines, type OrderLineJson } from '@/lib/order-stock'
import { sendOrderConfirmedToBuyer, sendOrderConfirmedToSeller } from '@/lib/email'
import type { PaymentResponse } from '@/lib/mercadopago'
import { finalizeCouponRedemptionForOrder, releaseCouponRedemptionForOrder } from '@/lib/coupons'

type OrderRow = {
  id: string
  buyer_name: string
  buyer_email: string
  total: number
  items: unknown
  payment_status: string
  order_status?: string
  mercadopago_payment_id?: string | null
  buyer_confirmation_email_sent_at?: string | null
  seller_notification_emails_sent?: string[] | null
}

type OrderItem = {
  product_id?: string
  product_name?: string
  name?: string
  quantity?: number
  price?: number
}

type SellerNotificationBucket = {
  sellerEmail: string
  sellerName: string
  items: Array<{ name: string; quantity: number; price: number }>
}

async function notifySellersForConfirmedOrder(order: OrderRow, options?: { force?: boolean }) {
  const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : []
  const productIds = items
    .map((item) => item.product_id)
    .filter((value): value is string => Boolean(value))

  if (productIds.length === 0) return { sent: 0, errors: [] as string[] }

  const { data: products, error } = await supabaseServer
    .from('products')
    .select('id, brand_id')
    .in('id', productIds)

  if (error) {
    console.error('seller notification products', error)
    return { sent: 0, errors: ['No se pudieron cargar productos para notificar vendedores.'] }
  }

  const brandIds = Array.from(new Set((products ?? []).map((product) => product.brand_id).filter(Boolean)))
  if (brandIds.length === 0) return { sent: 0, errors: [] as string[] }

  const { data: brands, error: brandError } = await supabaseServer
    .from('brands')
    .select('id, brand_name, owner_id')
    .in('id', brandIds)

  if (brandError) {
    console.error('seller notification brands', brandError)
    return { sent: 0, errors: ['No se pudieron cargar marcas para notificar vendedores.'] }
  }

  const ownerIds = Array.from(new Set((brands ?? []).map((brand) => brand.owner_id).filter(Boolean)))
  if (ownerIds.length === 0) return { sent: 0, errors: [] as string[] }

  const { data: profiles, error: profileError } = await supabaseServer
    .from('profiles')
    .select('id, full_name, email')
    .in('id', ownerIds)

  if (profileError) {
    console.error('seller notification profiles', profileError)
    return { sent: 0, errors: ['No se pudieron cargar perfiles de vendedores.'] }
  }

  const { data: sellerCreds, error: credError } = await supabaseServer
    .from('seller_auth_credentials')
    .select('seller_id, email')
    .in('seller_id', ownerIds)

  if (credError) {
    console.error('seller notification seller_auth_credentials', credError)
  }

  const credentialEmailBySeller = new Map(
    (sellerCreds ?? []).map((row) => [row.seller_id, String(row.email ?? '').trim().toLowerCase()])
  )

  const productToBrand = new Map((products ?? []).map((product) => [product.id, product.brand_id]))
  const brandMap = new Map((brands ?? []).map((brand) => [brand.id, brand]))
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
  const buckets = new Map<string, SellerNotificationBucket>()

  for (const item of items) {
    if (!item.product_id) continue
    const brandId = productToBrand.get(item.product_id)
    if (!brandId) continue
    const brand = brandMap.get(brandId)
    const ownerId = brand?.owner_id
    const profile = ownerId ? profileMap.get(ownerId) : null
    const fromCredentials = ownerId ? credentialEmailBySeller.get(ownerId) : undefined
    const sellerEmail = (fromCredentials && fromCredentials.length > 0
      ? fromCredentials
      : String(profile?.email ?? '').trim().toLowerCase())
    if (!sellerEmail) continue

    const sellerName = String(brand?.brand_name ?? profile?.full_name ?? 'vendedor')
    const current = buckets.get(sellerEmail) ?? {
      sellerEmail,
      sellerName,
      items: [],
    }

    current.items.push({
      name: item.product_name ?? item.name ?? 'Producto',
      quantity: Number(item.quantity ?? 1),
      price: Number(item.price ?? 0),
    })

    buckets.set(sellerEmail, current)
  }

  const alreadySent = new Set((order.seller_notification_emails_sent ?? []).map((email) => String(email).trim().toLowerCase()))
  const newlySent: string[] = []
  const errors: string[] = []

  for (const bucket of buckets.values()) {
    if (!options?.force && alreadySent.has(bucket.sellerEmail)) continue

    const result = await sendOrderConfirmedToSeller({
      to: bucket.sellerEmail,
      sellerName: bucket.sellerName,
      buyerName: order.buyer_name,
      buyerEmail: order.buyer_email,
      orderId: order.id,
      items: bucket.items,
      total: bucket.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    })

    if (result.sent) {
      newlySent.push(bucket.sellerEmail)
    } else if (result.errorMessage) {
      errors.push(`${bucket.sellerEmail}: ${result.errorMessage}`)
    } else {
      errors.push(`${bucket.sellerEmail}: envío rechazado`)
    }
  }

  if (newlySent.length > 0) {
    await supabaseServer
      .from('orders')
      .update({
        seller_notification_emails_sent: Array.from(new Set([...alreadySent, ...newlySent])),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
  }

  return { sent: newlySent.length, errors }
}

async function fetchOrderForPostPayment(orderId: string) {
  const { data: order, error } = await supabaseServer
    .from('orders')
    .select(
      `
      id,
      buyer_name,
      buyer_email,
      total,
      items,
      payment_status,
      order_status,
      mercadopago_payment_id,
      buyer_confirmation_email_sent_at,
      seller_notification_emails_sent
    `
    )
    .eq('id', orderId)
    .maybeSingle()

  if (error) {
    console.error('fetch order post payment', error)
    return null
  }

  return (order ?? null) as OrderRow | null
}

export async function ensureApprovedOrderNotifications(orderId: string) {
  return ensureApprovedOrderNotificationsWithOptions(orderId)
}

function isBusinessConfirmedPaymentStatus(paymentStatus?: string | null): boolean {
  const normalized = String(paymentStatus || '').toLowerCase()
  return normalized === 'completed' || normalized === 'pending' || normalized === 'in_process'
}

export async function ensureApprovedOrderNotificationsWithOptions(
  orderId: string,
  options?: { forceBuyer?: boolean; forceSellers?: boolean }
) {
  const order = await fetchOrderForPostPayment(orderId)
  if (!order) return { ok: false as const, order: null, result: undefined }
  if (!isBusinessConfirmedPaymentStatus(order.payment_status)) {
    return { ok: false as const, order, result: undefined }
  }

  const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : []

  let buyerAttempted = false
  let buyerSent = false
  let buyerError: string | undefined

  if (options?.forceBuyer || !order.buyer_confirmation_email_sent_at) {
    buyerAttempted = true
    const buyerResult = await sendOrderConfirmedToBuyer({
      to: order.buyer_email,
      buyerName: order.buyer_name,
      orderId: order.id,
      items: items.map((item) => ({
        name: item.product_name ?? item.name ?? 'Producto',
        quantity: Number(item.quantity ?? 1),
        price: Number(item.price ?? 0),
      })),
      total: Number(order.total ?? 0),
    })

    buyerSent = buyerResult.sent
    if (!buyerResult.sent) {
      buyerError = buyerResult.errorMessage
    }

    if (buyerResult.sent) {
      await supabaseServer
        .from('orders')
        .update({
          buyer_confirmation_email_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
      order.buyer_confirmation_email_sent_at = new Date().toISOString()
    }
  }

  const sellerOutcome = await notifySellersForConfirmedOrder(order, { force: options?.forceSellers })

  return {
    ok: true as const,
    order,
    result: {
      buyerAttempted,
      buyerSent,
      buyerError,
      sellersSent: sellerOutcome.sent,
      sellerErrors: sellerOutcome.errors,
    },
  }
}

export async function applyApprovedPaymentToOrder(orderId: string, payment: PaymentResponse) {
  const effectivePaymentStatus = payment.status === 'approved' ? 'completed' : 'pending'
  const { data: updatedRows, error: upErr } = await supabaseServer
    .from('orders')
    .update({
      payment_status: effectivePaymentStatus,
      order_status: 'processing',
      mercadopago_payment_id: String(payment.id),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .in('payment_status', ['pending', 'completed'])
    .select('id, buyer_name, buyer_email, total, items, payment_status')

  if (upErr) {
    console.error('orders update payment', upErr)
    return { ok: false as const, changed: false as const }
  }

  const updated = updatedRows?.[0] as OrderRow | undefined
  if (updated) {
    if (updated.items) {
      await decrementStockForOrderLines(updated.items as OrderLineJson[])
    }
    await finalizeCouponRedemptionForOrder(orderId)
  }

  await ensureApprovedOrderNotifications(orderId)

  return { ok: true as const, changed: Boolean(updated), order: updated }
}

export async function applyRejectedPaymentToOrder(orderId: string, paymentId: string) {
  const { error } = await supabaseServer
    .from('orders')
    .update({
      payment_status: 'failed',
      mercadopago_payment_id: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('payment_status', 'pending')

  if (error) {
    console.error('orders reject payment', error)
    return { ok: false as const }
  }

  await releaseCouponRedemptionForOrder(orderId)

  return { ok: true as const }
}
