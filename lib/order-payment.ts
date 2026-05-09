import { supabaseServer } from '@/lib/supabase'
import { decrementStockForOrderLines, type OrderLineJson } from '@/lib/order-stock'
import { sendOrderConfirmedToBuyer, sendOrderConfirmedToSeller } from '@/lib/email'
import type { PaymentResponse } from '@/lib/mercadopago'

type OrderRow = {
  id: string
  buyer_name: string
  buyer_email: string
  total: number
  items: unknown
  payment_status: string
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

async function notifySellersForConfirmedOrder(order: OrderRow) {
  const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : []
  const productIds = items
    .map((item) => item.product_id)
    .filter((value): value is string => Boolean(value))

  if (productIds.length === 0) return

  const { data: products, error } = await supabaseServer
    .from('products')
    .select('id, brand_id')
    .in('id', productIds)

  if (error) {
    console.error('seller notification products', error)
    return
  }

  const brandIds = Array.from(new Set((products ?? []).map((product) => product.brand_id).filter(Boolean)))
  if (brandIds.length === 0) return

  const { data: brands, error: brandError } = await supabaseServer
    .from('brands')
    .select('id, brand_name, owner_id')
    .in('id', brandIds)

  if (brandError) {
    console.error('seller notification brands', brandError)
    return
  }

  const ownerIds = Array.from(new Set((brands ?? []).map((brand) => brand.owner_id).filter(Boolean)))
  if (ownerIds.length === 0) return

  const { data: profiles, error: profileError } = await supabaseServer
    .from('profiles')
    .select('id, full_name, email')
    .in('id', ownerIds)

  if (profileError) {
    console.error('seller notification profiles', profileError)
    return
  }

  const productToBrand = new Map((products ?? []).map((product) => [product.id, product.brand_id]))
  const brandMap = new Map((brands ?? []).map((brand) => [brand.id, brand]))
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
  const buckets = new Map<string, SellerNotificationBucket>()

  for (const item of items) {
    if (!item.product_id) continue
    const brandId = productToBrand.get(item.product_id)
    if (!brandId) continue
    const brand = brandMap.get(brandId)
    const profile = brand?.owner_id ? profileMap.get(brand.owner_id) : null
    const sellerEmail = String(profile?.email ?? '').trim().toLowerCase()
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

  for (const bucket of buckets.values()) {
    await sendOrderConfirmedToSeller({
      to: bucket.sellerEmail,
      sellerName: bucket.sellerName,
      buyerName: order.buyer_name,
      buyerEmail: order.buyer_email,
      orderId: order.id,
      items: bucket.items,
      total: bucket.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    })
  }
}

export async function applyApprovedPaymentToOrder(orderId: string, payment: PaymentResponse) {
  const { data: updatedRows, error: upErr } = await supabaseServer
    .from('orders')
    .update({
      payment_status: 'completed',
      order_status: 'processing',
      mercadopago_payment_id: String(payment.id),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('payment_status', 'pending')
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

    const items = Array.isArray(updated.items) ? (updated.items as OrderItem[]) : []
    await sendOrderConfirmedToBuyer({
      to: updated.buyer_email,
      buyerName: updated.buyer_name,
      orderId: updated.id,
      items: items.map((item) => ({
        name: item.product_name ?? item.name ?? 'Producto',
        quantity: Number(item.quantity ?? 1),
        price: Number(item.price ?? 0),
      })),
      total: Number(updated.total ?? 0),
    })
    await notifySellersForConfirmedOrder(updated)
  }

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

  return { ok: true as const }
}
