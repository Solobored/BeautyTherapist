import { NextRequest, NextResponse } from 'next/server'
import { isChileCountry } from '@/lib/shipping'
import { getChileShippingQuoteDetails } from '@/lib/shipping-checkout-server'
import type { ChileDeliveryChannel } from '@/lib/chile-shipping'
import { supabaseServer } from '@/lib/supabase'
import { getChileExpressRateForRegion, REGION_TO_CHILE_EXPRESS_ZONE } from '@/lib/chile-express-shipping'
import { isMissingShippingSchemaError } from '@/lib/products-compat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CartLine = { productId: string; quantity: number }
type ProductRow = {
  id: string
  price?: number | null
  shipping_mode?: 'blue_express' | 'chile_express' | 'custom_group' | null
  product_shipping_groups?: Array<{ shipping_group_id: string }> | null
}

type ShippingGroupRow = {
  id: string
  name: string
  carrier: 'blue_express' | 'chile_express' | 'custom'
  rate_rm?: number | null
  rate_sur?: number | null
  rate_norte?: number | null
  rate_extremo?: number | null
  rate_prioritario?: number | null
  free_shipping_threshold?: number | null
  eta_rm?: string | null
  eta_sur?: string | null
  eta_norte?: string | null
  eta_extremo?: string | null
  notes?: string | null
}

type QuoteBreakdownItem = {
  key: string
  carrier: 'blue_express' | 'chile_express' | 'custom'
  label: string
  shippingClp: number
  eta?: string | null
  notes?: string | null
  parcelLabel?: string
  totalGrams?: number
  itemCount: number
}

function groupZoneRate(group: ShippingGroupRow, regionCode: string) {
  const zone = REGION_TO_CHILE_EXPRESS_ZONE[regionCode]
  if (!zone) return { zone: null, shippingClp: null, eta: null as string | null }

  const shippingClp =
    zone === 'rm'
      ? group.rate_rm
      : zone === 'sur'
        ? group.rate_sur
        : zone === 'norte'
          ? group.rate_norte
          : zone === 'prioritario'
            ? group.rate_prioritario
            : group.rate_extremo

  const eta =
    zone === 'rm'
      ? group.eta_rm
      : zone === 'sur'
        ? group.eta_sur
        : zone === 'norte'
          ? group.eta_norte
          : group.eta_extremo

  return { zone, shippingClp, eta }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const country = String(body.country ?? 'Chile').trim()
    const regionCode = String(body.chileRegionCode ?? '').trim()
    const channel = body.chileDeliveryChannel === 'punto' ? 'punto' : ('domicilio' as ChileDeliveryChannel)
    const items = (body.items ?? []) as { productId?: string; quantity?: number }[]

    if (!isChileCountry(country)) {
      return NextResponse.json(
        { error: 'Cotización por peso/región solo aplica a Chile.' },
        { status: 400 }
      )
    }

    if (!regionCode) {
      return NextResponse.json({ error: 'Indica la región de destino.' }, { status: 400 })
    }

    const cartItems = items
      .filter((i) => i.productId && i.quantity && i.quantity > 0)
      .map((i) => ({ productId: String(i.productId), quantity: Math.floor(Number(i.quantity)) }))

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Sin productos para cotizar.' }, { status: 400 })
    }

    const productIds = cartItems.map((item) => item.productId)
    let { data: productRows, error: productError }: { data: ProductRow[] | null; error: any } = await supabaseServer
      .from('products')
      .select(
        `
        id,
        price,
        shipping_mode,
        product_shipping_groups (shipping_group_id)
      `
      )
      .in('id', productIds)

    if (productError && isMissingShippingSchemaError(productError)) {
      const legacyProducts: { data: any[] | null; error: any } = await supabaseServer
        .from('products')
        .select('id, price')
        .in('id', productIds)
      productRows = (legacyProducts.data ?? []).map((row) => ({
        ...row,
        shipping_mode: 'blue_express',
        product_shipping_groups: [],
      }))
      productError = legacyProducts.error
    }

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    const productsById = new Map((productRows ?? []).map((row) => [row.id, row]))
    const cartProducts = cartItems
      .map((item) => {
        const product = productsById.get(item.productId)
        if (!product) return null
        return { product, item }
      })
      .filter((entry): entry is { product: ProductRow; item: CartLine } => Boolean(entry))

    const groupIds = Array.from(
      new Set(
        cartProducts
          .map((entry) => entry.product.product_shipping_groups?.[0]?.shipping_group_id)
          .filter((value): value is string => Boolean(value))
      )
    )

    const shippingGroups = new Map<string, ShippingGroupRow>()
    if (groupIds.length > 0) {
      const { data: groups, error: groupsError } = await supabaseServer
        .from('shipping_groups')
        .select(
          `
          id,
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
          notes
        `
        )
        .in('id', groupIds)

      if (groupsError) {
        return NextResponse.json({ error: groupsError.message }, { status: 500 })
      }

      ;(groups ?? []).forEach((group) => shippingGroups.set(group.id, group))
    }

    const blueItems: CartLine[] = []
    const chileItems: CartLine[] = []
    const customBuckets = new Map<string, { group: ShippingGroupRow; items: CartLine[] }>()

    for (const entry of cartProducts) {
      const shippingMode = entry.product.shipping_mode ?? 'blue_express'
      const shippingGroupId = entry.product.product_shipping_groups?.[0]?.shipping_group_id
      const assignedGroup = shippingGroupId ? shippingGroups.get(shippingGroupId) : null

      if (shippingMode === 'custom_group') {
        if (!assignedGroup) {
          return NextResponse.json({ error: 'Hay productos con grupo personalizado sin grupo asignado.' }, { status: 400 })
        }

        if (assignedGroup.carrier === 'blue_express') {
          blueItems.push(entry.item)
          continue
        }

        if (assignedGroup.carrier === 'chile_express') {
          chileItems.push(entry.item)
          continue
        }

        const current = customBuckets.get(assignedGroup.id)
        if (current) {
          current.items.push(entry.item)
        } else {
          customBuckets.set(assignedGroup.id, { group: assignedGroup, items: [entry.item] })
        }
        continue
      }

      if (shippingMode === 'chile_express') {
        chileItems.push(entry.item)
        continue
      }

      blueItems.push(entry.item)
    }

    const breakdown: QuoteBreakdownItem[] = []

    if (blueItems.length > 0) {
      const { quote, totalGrams } = await getChileShippingQuoteDetails({
        chileRegionCode: regionCode,
        chileDeliveryChannel: channel,
        cartItems: blueItems,
      })

      if (!quote) {
        return NextResponse.json({ error: 'Región no válida para Blue Express.' }, { status: 400 })
      }

      breakdown.push({
        key: 'blue_express',
        carrier: 'blue_express',
        label: `Blue Express${channel === 'punto' ? ' · retiro en punto' : ' · despacho a domicilio'}`,
        shippingClp: quote.clp,
        eta: quote.region.eta,
        parcelLabel: quote.parcel.label,
        totalGrams,
        itemCount: blueItems.reduce((sum, item) => sum + item.quantity, 0),
        notes:
          'Bulto XS hasta 0,5 kg; S hasta 3 kg. Si superas 3 kg se cotizan varios bultos S.',
      })
    }

    if (chileItems.length > 0) {
      const rate = getChileExpressRateForRegion(regionCode)
      if (!rate) {
        return NextResponse.json({ error: 'Region no valida para Chile Express.' }, { status: 400 })
      }

      breakdown.push({
        key: 'chile_express',
        carrier: 'chile_express',
        label: 'Chile Express',
        shippingClp: rate.clp,
        eta: rate.eta,
        itemCount: chileItems.reduce((sum, item) => sum + item.quantity, 0),
        notes: 'Tarifa fija por zona para este metodo.',
      })
    }

    for (const [groupId, bucket] of customBuckets.entries()) {
      const subtotal = bucket.items.reduce((sum, item) => {
        const product = productsById.get(item.productId)
        return sum + Number(product?.price ?? 0) * item.quantity
      }, 0)

      const { zone, shippingClp, eta } = groupZoneRate(bucket.group, regionCode)
      if (!zone) {
        return NextResponse.json({ error: 'Region no valida.' }, { status: 400 })
      }

      const effectiveClp =
        bucket.group.free_shipping_threshold != null && subtotal >= Number(bucket.group.free_shipping_threshold)
          ? 0
          : shippingClp

      if (effectiveClp == null) {
        return NextResponse.json({ error: `El grupo "${bucket.group.name}" no tiene tarifa para esta zona.` }, { status: 400 })
      }

      breakdown.push({
        key: groupId,
        carrier: 'custom',
        label: bucket.group.name,
        shippingClp: Number(effectiveClp),
        eta,
        notes: bucket.group.notes,
        itemCount: bucket.items.reduce((sum, item) => sum + item.quantity, 0),
      })
    }

    const shippingClp = breakdown.reduce((sum, part) => sum + part.shippingClp, 0)
    const shipmentCount = breakdown.length
    const carriers = Array.from(new Set(breakdown.map((part) => part.carrier)))

    let note: string | null = null
    if (shipmentCount === 1) {
      const only = breakdown[0]
      note =
        only.carrier === 'blue_express'
          ? `1 envio calculado con Blue Express · ${only.parcelLabel ?? ''} · ${only.eta ?? ''}`.trim()
          : `1 envio con ${only.label}${only.eta ? ` · ${only.eta}` : ''}`
    } else {
      note = `Tu compra se divide en ${shipmentCount} envios y se suman sus tarifas para que llegue por cada metodo correspondiente.`
    }

    return NextResponse.json({
      shippingClp,
      shipmentCount,
      carriers,
      channel,
      note,
      breakdown,
      totalGrams:
        breakdown.length === 1 && breakdown[0].carrier === 'blue_express' ? breakdown[0].totalGrams : undefined,
      parcel: breakdown.length === 1 && breakdown[0].carrier === 'blue_express'
        ? { label: breakdown[0].parcelLabel }
        : undefined,
      eta: breakdown.length === 1 ? breakdown[0].eta : undefined,
      regionLabel:
        breakdown.length === 1 && breakdown[0].carrier === 'blue_express'
          ? undefined
          : null,
    })
  } catch (e) {
    console.error('shipping-quote', e)
    return NextResponse.json({ error: 'Error al cotizar envío' }, { status: 500 })
  }
}
