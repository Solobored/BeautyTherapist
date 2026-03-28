import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { createPreference } from '@/lib/mercadopago'
import { type ShippingKind } from '@/lib/shipping'
import { resolveServerShippingClp } from '@/lib/shipping-checkout-server'
import type { ChileDeliveryChannel } from '@/lib/chile-shipping'
import { buildMercadoPagoCheckoutUrls, mercadoPagoAllowsAutoReturn } from '@/lib/mp-public-url'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export type CheckoutRequestBody = {
  items: Array<{
    productId: string
    productName: string
    productImage: string
    quantity: number
    price: number
  }>
  buyerEmail: string
  buyerName: string
  buyerPhone: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zip: string
    country: string
    lat?: number
    lng?: number
  }
  shippingKind?: ShippingKind
  /** Envío Chile: región de destino (código) */
  chileRegionCode?: string
  /** domicilio | punto (Blue Express / retiro) */
  chileDeliveryChannel?: ChileDeliveryChannel
  couponCode?: string
  subtotal: number
  shippingCost: number
  discount: number
  total: number
}

function mpInitPoint(pref: { init_point?: string; sandbox_init_point?: string }): string | null {
  const useSandbox = process.env.MERCADOPAGO_USE_SANDBOX === 'true'
  if (useSandbox) {
    return pref.sandbox_init_point || pref.init_point || null
  }
  return pref.init_point || pref.sandbox_init_point || null
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()) {
      return NextResponse.json(
        {
          error:
            'Mercado Pago no está configurado. Define MERCADOPAGO_ACCESS_TOKEN en las variables de entorno del servidor.',
        },
        { status: 503 }
      )
    }

    const body: CheckoutRequestBody = await request.json()

    if (!body.items || !body.buyerEmail || body.total == null) {
      return NextResponse.json(
        { error: 'Missing required fields: items, buyerEmail, or total' },
        { status: 400 }
      )
    }

    if (body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const shippingKind: ShippingKind = body.shippingKind === 'international' ? 'international' : 'national'
    const chileChannel: ChileDeliveryChannel | undefined =
      body.chileDeliveryChannel === 'punto' ? 'punto' : body.chileDeliveryChannel === 'domicilio' ? 'domicilio' : undefined

    const shippingResolved = await resolveServerShippingClp({
      shippingKind,
      shippingAddress: body.shippingAddress,
      chileRegionCode: body.chileRegionCode,
      chileDeliveryChannel: chileChannel,
      cartItems: body.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    })

    if (!shippingResolved.ok) {
      return NextResponse.json({ error: shippingResolved.error }, { status: 400 })
    }

    const serverShipping = shippingResolved.clp

    if (Math.abs(Math.round(body.shippingCost) - serverShipping) > 2) {
      return NextResponse.json(
        {
          error: 'El costo de envío no coincide. Vuelve al checkout y actualiza la página.',
          expectedShippingClp: serverShipping,
        },
        { status: 400 }
      )
    }

    const roundedSubtotal = body.items.reduce(
      (sum, i) => sum + Math.round(i.price) * i.quantity,
      0
    )
    const discount = Math.round(body.discount)
    const expectedTotal = roundedSubtotal + serverShipping - discount
    if (Math.abs(Math.round(body.total) - expectedTotal) > 2) {
      return NextResponse.json(
        { error: 'El total no coincide con los ítems, envío y descuento.' },
        { status: 400 }
      )
    }

    for (const item of body.items) {
      const { data: product, error: productError } = await supabaseServer
        .from('products')
        .select('stock')
        .eq('id', item.productId)
        .single()

      if (productError || !product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for product ${item.productName}. Available: ${product.stock}`,
          },
          { status: 400 }
        )
      }
    }

    if (body.couponCode) {
      const { data: coupon, error: couponError } = await supabaseServer
        .from('coupons')
        .select('*')
        .eq('code', body.couponCode)
        .eq('is_active', true)
        .single()

      if (couponError || !coupon) {
        return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
      }

      if (coupon.min_order && body.subtotal < coupon.min_order) {
        return NextResponse.json(
          { error: `Minimum order amount is $${coupon.min_order} for this coupon` },
          { status: 400 }
        )
      }

      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
      }
    }

    const lat = body.shippingAddress.lat
    const lng = body.shippingAddress.lng
    const cleanAddress = {
      ...body.shippingAddress,
      ...(typeof lat === 'number' && Number.isFinite(lat) && typeof lng === 'number' && Number.isFinite(lng)
        ? { lat, lng }
        : {}),
      shipping_kind: shippingKind,
      chile_region_code: body.chileRegionCode?.trim() ?? null,
      chile_delivery_channel: chileChannel ?? null,
    }

    const { data: order, error: orderError } = await supabaseServer
      .from('orders')
      .insert({
        buyer_email: body.buyerEmail,
        buyer_name: body.buyerName,
        buyer_phone: body.buyerPhone,
        shipping_address: cleanAddress,
        items: body.items.map((item) => ({
          product_id: item.productId,
          product_name: item.productName,
          product_image: item.productImage,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: body.subtotal,
        shipping_cost: serverShipping,
        discount: body.discount,
        total: body.total,
        payment_method: 'mercadopago',
        payment_status: 'pending',
        order_status: 'pending',
        coupon_code: body.couponCode || null,
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Unable to create order' }, { status: 500 })
    }

    const gross = body.items.reduce((s, i) => s + Math.round(i.price) * i.quantity, 0)
    const discountCapped = Math.min(discount, Math.max(0, gross))
    const netFactor = gross > 0 ? (gross - discountCapped) / gross : 1

    const mpItems: Array<{
      title: string
      quantity: number
      unit_price: number
      currency_id: string
      picture_url?: string
    }> = body.items.map((item) => ({
      title: item.productName.slice(0, 127),
      quantity: item.quantity,
      unit_price: Math.max(1, Math.round(item.price * netFactor)),
      currency_id: 'CLP',
      ...(item.productImage?.startsWith('http') ? { picture_url: item.productImage } : {}),
    }))

    let itemsSum = mpItems.reduce((s, i) => s + i.unit_price * i.quantity, 0)
    const targetNet = gross - discountCapped
    if (mpItems.length > 0 && itemsSum !== targetNet) {
      const last = mpItems[mpItems.length - 1]
      const diff = targetNet - itemsSum
      last.unit_price = Math.max(1, last.unit_price + Math.round(diff / last.quantity))
    }

    if (serverShipping > 0) {
      mpItems.push({
        title: 'Envío',
        quantity: 1,
        unit_price: serverShipping,
        currency_id: 'CLP',
      })
    }

    try {
      const urls = buildMercadoPagoCheckoutUrls(order.id)
      const notifyIsHttps = urls.notification.startsWith('https://')
      const useAutoReturn = mercadoPagoAllowsAutoReturn(urls.success)

      const preference = await createPreference({
        items: mpItems,
        payer: {
          name: body.buyerName,
          email: body.buyerEmail,
        },
        back_urls: {
          success: urls.success,
          failure: urls.failure,
          pending: urls.pending,
        },
        ...(notifyIsHttps ? { notification_url: urls.notification } : {}),
        ...(useAutoReturn ? { auto_return: 'approved' as const } : {}),
        external_reference: order.id,
        metadata: {
          order_id: order.id,
          buyer_email: body.buyerEmail,
          coupon_code: body.couponCode || '',
        },
      })

      const { error: prefMetaErr } = await supabaseServer
        .from('orders')
        .update({ mercadopago_preference_id: preference.id, updated_at: new Date().toISOString() })
        .eq('id', order.id)
      if (prefMetaErr) console.warn('mercadopago_preference_id update failed', prefMetaErr)

      const initPoint = mpInitPoint(preference)
      if (!initPoint) {
        return NextResponse.json(
          { error: 'Mercado Pago no devolvió un enlace de pago.', orderId: order.id },
          { status: 502 }
        )
      }

      return NextResponse.json({
        preferenceId: preference.id,
        initPoint,
        orderId: order.id,
      })
    } catch (mpErr) {
      console.error('Mercado Pago preference error:', mpErr)
      return NextResponse.json(
        {
          error:
            mpErr instanceof Error
              ? mpErr.message
              : 'Error al crear la preferencia de pago en Mercado Pago.',
          orderId: order.id,
        },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a checkout.' },
    { status: 405 }
  )
}
