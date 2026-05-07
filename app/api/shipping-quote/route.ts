import { NextRequest, NextResponse } from 'next/server'
import { isChileCountry } from '@/lib/shipping'
import { getChileShippingQuoteDetails } from '@/lib/shipping-checkout-server'
import type { ChileDeliveryChannel } from '@/lib/chile-shipping'
import { supabaseServer } from '@/lib/supabase'
import { getChileExpressRateForRegion, REGION_TO_CHILE_EXPRESS_ZONE } from '@/lib/chile-express-shipping'
import { isMissingShippingSchemaError } from '@/lib/products-compat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const country = String(body.country ?? 'Chile').trim()
    const regionCode = String(body.chileRegionCode ?? '').trim()
    const channel = body.chileDeliveryChannel === 'punto' ? 'punto' : ('domicilio' as ChileDeliveryChannel)
    const items = (body.items ?? []) as { productId?: string; quantity?: number }[]
    const requestedShippingMode = body.shippingMode as
      | 'blue_express'
      | 'chile_express'
      | 'custom_group'
      | undefined

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
    let { data: productRows, error: productError }: { data: any[] | null; error: any } = await supabaseServer
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
      .map((item) => productsById.get(item.productId))
      .filter((product): product is NonNullable<typeof product> => Boolean(product))

    // Si el carrito mezcla modos, aplicamos el del producto de mayor precio para mantener una sola cotizacion.
    const resolvedShippingMode =
      requestedShippingMode ??
      cartProducts
        .slice()
        .sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0))[0]?.shipping_mode ??
      'blue_express'

    if (resolvedShippingMode === 'chile_express') {
      const rate = getChileExpressRateForRegion(regionCode)
      if (!rate) {
        return NextResponse.json({ error: 'Region no valida para Chile Express.' }, { status: 400 })
      }

      return NextResponse.json({
        shippingClp: rate.clp,
        zone: rate.zone,
        carrier: 'chile_express',
        eta: rate.eta,
        label: rate.label,
      })
    }

    if (resolvedShippingMode === 'custom_group') {
      const anchorProduct = cartProducts
        .slice()
        .sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0))[0]

      const shippingGroupId = anchorProduct?.product_shipping_groups?.[0]?.shipping_group_id
      if (!shippingGroupId) {
        return NextResponse.json({ error: 'No hay grupo de envio asignado.' }, { status: 400 })
      }

      const { data: group, error: groupError } = await supabaseServer
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
        .eq('id', shippingGroupId)
        .maybeSingle()

      if (groupError || !group) {
        return NextResponse.json({ error: 'Grupo de envio no encontrado.' }, { status: 404 })
      }

      const zone = REGION_TO_CHILE_EXPRESS_ZONE[regionCode]
      if (!zone) {
        return NextResponse.json({ error: 'Region no valida.' }, { status: 400 })
      }

      const subtotal = cartItems.reduce((sum, item) => {
        const product = productsById.get(item.productId)
        return sum + Number(product?.price ?? 0) * item.quantity
      }, 0)

      if (group.free_shipping_threshold != null && subtotal >= Number(group.free_shipping_threshold)) {
        return NextResponse.json({
          shippingClp: 0,
          groupName: group.name,
          carrier: 'custom',
          eta:
            zone === 'rm'
              ? group.eta_rm
              : zone === 'sur'
                ? group.eta_sur
                : zone === 'norte'
                  ? group.eta_norte
                  : group.eta_extremo,
          notes: group.notes,
        })
      }

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

      if (shippingClp == null) {
        return NextResponse.json({ error: 'Este grupo no tiene tarifa para la zona.' }, { status: 400 })
      }

      return NextResponse.json({
        shippingClp,
        groupName: group.name,
        carrier: group.carrier === 'chile_express' ? 'chile_express' : 'custom',
        eta:
          zone === 'rm'
            ? group.eta_rm
            : zone === 'sur'
              ? group.eta_sur
              : zone === 'norte'
                ? group.eta_norte
                : group.eta_extremo,
        notes: group.notes,
      })
    }

    const { quote, totalGrams } = await getChileShippingQuoteDetails({
      chileRegionCode: regionCode,
      chileDeliveryChannel: channel,
      cartItems,
    })

    if (!quote) {
      return NextResponse.json({ error: 'Región no válida.' }, { status: 400 })
    }

    return NextResponse.json({
      shippingClp: quote.clp,
      totalGrams,
      parcel: quote.parcel,
      regionLabel: quote.region.label,
      zone: quote.region.zone,
      eta: quote.region.eta,
      channel,
    })
  } catch (e) {
    console.error('shipping-quote', e)
    return NextResponse.json({ error: 'Error al cotizar envío' }, { status: 500 })
  }
}
