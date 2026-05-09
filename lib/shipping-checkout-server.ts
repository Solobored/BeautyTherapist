import { supabaseServer } from '@/lib/supabase'
import {
  computeChileShippingClp,
  totalCartGrams,
  type ChileDeliveryChannel,
  type ProductShippingRow,
} from '@/lib/chile-shipping'
import { getChileExpressRateForRegion, REGION_TO_CHILE_EXPRESS_ZONE } from '@/lib/chile-express-shipping'
import { internationalFlatClp, isChileCountry, nationalFlatClp } from '@/lib/shipping'
import type { ShippingKind } from '@/lib/shipping'
import { isMissingShippingSchemaError } from '@/lib/products-compat'

export type CartLineInput = { productId: string; quantity: number }

type ProductRow = {
  id: string
  price?: number | null
  shipping_mode?: 'blue_express' | 'chile_express' | 'custom_group' | null
  product_shipping_groups?: Array<{ shipping_group_id: string }> | null
  net_content_ml?: number | null
  grams_per_ml?: number | null
  weight_override_g?: number | null
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

export type CheckoutShippingBreakdownItem = {
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

export type CheckoutShippingQuote = {
  shippingClp: number
  shipmentCount: number
  carriers: Array<'blue_express' | 'chile_express' | 'custom'>
  channel: ChileDeliveryChannel
  note: string | null
  breakdown: CheckoutShippingBreakdownItem[]
  totalGrams?: number
  parcel?: { label?: string }
  eta?: string
  regionLabel?: string | null
}

function buildProductShippingMap(rows: ProductRow[] | null | undefined) {
  return new Map<string, ProductShippingRow>(
    (rows ?? []).map((r) => [
      r.id,
      {
        id: r.id,
        net_content_ml: r.net_content_ml != null ? Number(r.net_content_ml) : null,
        grams_per_ml: r.grams_per_ml != null ? Number(r.grams_per_ml) : null,
        weight_override_g: r.weight_override_g != null ? Number(r.weight_override_g) : null,
      },
    ])
  )
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

async function loadCartProducts(ids: string[]) {
  let { data: rows, error }: { data: ProductRow[] | null; error: any } = await supabaseServer
    .from('products')
    .select(
      `
      id,
      price,
      shipping_mode,
      product_shipping_groups (shipping_group_id),
      net_content_ml,
      grams_per_ml,
      weight_override_g
    `
    )
    .in('id', ids)

  if (error && isMissingShippingSchemaError(error)) {
    const { data: legacyRows, error: legacyError } = await supabaseServer
      .from('products')
      .select('id, price, net_content_ml, grams_per_ml, weight_override_g')
      .in('id', ids)

    rows = (legacyRows ?? []).map((row) => ({
      ...row,
      shipping_mode: 'blue_express',
      product_shipping_groups: [],
    }))
    error = legacyError
  }

  return { rows, error }
}

export async function resolveChileCheckoutShippingQuote(input: {
  chileRegionCode: string
  chileDeliveryChannel: ChileDeliveryChannel
  cartItems: CartLineInput[]
}): Promise<{ ok: true; quote: CheckoutShippingQuote } | { ok: false; error: string }> {
  const regionCode = input.chileRegionCode.trim()
  const channel = input.chileDeliveryChannel
  const ids = [...new Set(input.cartItems.map((l) => l.productId).filter(Boolean))]

  if (ids.length === 0) {
    return { ok: false, error: 'Carrito vacío' }
  }

  const { rows, error } = await loadCartProducts(ids)
  if (error) {
    console.error('shipping products', error)
    return { ok: false, error: 'No se pudieron cargar los productos para el envío.' }
  }

  const productsById = new Map((rows ?? []).map((row) => [row.id, row]))
  const productWeights = buildProductShippingMap(rows)
  const cartProducts = input.cartItems
    .map((item) => {
      const product = productsById.get(item.productId)
      if (!product) return null
      return { product, item }
    })
    .filter((entry): entry is { product: ProductRow; item: CartLineInput } => Boolean(entry))

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
      return { ok: false, error: groupsError.message }
    }

    ;(groups ?? []).forEach((group) => shippingGroups.set(group.id, group))
  }

  const blueItems: CartLineInput[] = []
  const chileItems: CartLineInput[] = []
  const customBuckets = new Map<string, { group: ShippingGroupRow; items: CartLineInput[] }>()

  for (const entry of cartProducts) {
    const shippingMode = entry.product.shipping_mode ?? 'blue_express'
    const shippingGroupId = entry.product.product_shipping_groups?.[0]?.shipping_group_id
    const assignedGroup = shippingGroupId ? shippingGroups.get(shippingGroupId) : null

    if (shippingMode === 'custom_group') {
      if (!assignedGroup) {
        return { ok: false, error: 'Hay productos con grupo personalizado sin grupo asignado.' }
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

  const breakdown: CheckoutShippingBreakdownItem[] = []

  if (blueItems.length > 0) {
    const totalGrams = totalCartGrams(blueItems, productWeights)
    const quote = computeChileShippingClp({
      regionCode,
      channel,
      totalGrams,
    })

    if (!quote) {
      return { ok: false, error: 'Región no válida para Blue Express.' }
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
      return { ok: false, error: 'Region no valida para Chile Express.' }
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
      return { ok: false, error: 'Region no valida.' }
    }

    const effectiveClp =
      bucket.group.free_shipping_threshold != null && subtotal >= Number(bucket.group.free_shipping_threshold)
        ? 0
        : shippingClp

    if (effectiveClp == null) {
      return { ok: false, error: `El grupo "${bucket.group.name}" no tiene tarifa para esta zona.` }
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
        : only.carrier === 'chile_express'
          ? `1 envio con Chile Express${only.eta ? ` · ${only.eta}` : ''}`
          : `1 envio personalizado${only.eta ? ` · ${only.eta}` : ''}`
  } else {
    note = `Tu compra se divide en ${shipmentCount} envios y se suman sus tarifas para que llegue por cada metodo correspondiente.`
  }

  return {
    ok: true,
    quote: {
      shippingClp,
      shipmentCount,
      carriers,
      channel,
      note,
      breakdown,
      totalGrams:
        breakdown.length === 1 && breakdown[0].carrier === 'blue_express' ? breakdown[0].totalGrams : undefined,
      parcel:
        breakdown.length === 1 && breakdown[0].carrier === 'blue_express'
          ? { label: breakdown[0].parcelLabel }
          : undefined,
      eta: breakdown.length === 1 ? breakdown[0].eta ?? undefined : undefined,
      regionLabel:
        breakdown.length === 1 && breakdown[0].carrier === 'blue_express'
          ? undefined
          : null,
    },
  }
}

export async function resolveServerShippingClp(input: {
  shippingKind: ShippingKind
  shippingAddress: { country: string }
  chileRegionCode?: string
  chileDeliveryChannel?: ChileDeliveryChannel
  cartItems: CartLineInput[]
}): Promise<{ ok: true; clp: number; mode: string } | { ok: false; error: string }> {
  const { shippingKind, shippingAddress, chileRegionCode, chileDeliveryChannel, cartItems } = input

  if (shippingKind === 'international') {
    return { ok: true, clp: internationalFlatClp(), mode: 'international_flat' }
  }

  if (!isChileCountry(shippingAddress.country)) {
    return { ok: true, clp: nationalFlatClp(), mode: 'national_outside_chile_flat' }
  }

  if (!chileRegionCode?.trim() || !chileDeliveryChannel) {
    return { ok: false, error: 'Selecciona región de destino y tipo de entrega (Chile).' }
  }

  const quoteResult = await resolveChileCheckoutShippingQuote({
    chileRegionCode,
    chileDeliveryChannel,
    cartItems,
  })

  if (!quoteResult.ok) {
    return { ok: false, error: quoteResult.error }
  }

  return {
    ok: true,
    clp: quoteResult.quote.shippingClp,
    mode: `chile_${chileDeliveryChannel}_quote`,
  }
}

export async function getChileShippingQuoteDetails(input: {
  chileRegionCode: string
  chileDeliveryChannel: ChileDeliveryChannel
  cartItems: CartLineInput[]
}) {
  const ids = [...new Set(input.cartItems.map((l) => l.productId).filter(Boolean))]
  const { rows } = await loadCartProducts(ids)
  const map = buildProductShippingMap(rows)

  const totalGrams = totalCartGrams(input.cartItems, map)
  const quote = computeChileShippingClp({
    regionCode: input.chileRegionCode.trim(),
    channel: input.chileDeliveryChannel,
    totalGrams,
  })

  return { quote, totalGrams, map }
}
