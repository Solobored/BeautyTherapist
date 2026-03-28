import { supabaseServer } from '@/lib/supabase'
import {
  computeChileShippingClp,
  totalCartGrams,
  type ChileDeliveryChannel,
  type ProductShippingRow,
} from '@/lib/chile-shipping'
import { internationalFlatClp, isChileCountry, nationalFlatClp } from '@/lib/shipping'
import type { ShippingKind } from '@/lib/shipping'

export type CartLineInput = { productId: string; quantity: number }

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

  const ids = [...new Set(cartItems.map((l) => l.productId).filter(Boolean))]
  if (ids.length === 0) {
    return { ok: false, error: 'Carrito vacío' }
  }

  const { data: rows, error } = await supabaseServer
    .from('products')
    .select('id, net_content_ml, grams_per_ml, weight_override_g')
    .in('id', ids)

  if (error) {
    console.error('shipping products', error)
    return { ok: false, error: 'No se pudieron cargar los productos para el envío.' }
  }

  const map = new Map<string, ProductShippingRow>(
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

  const totalGrams = totalCartGrams(cartItems, map)
  const quote = computeChileShippingClp({
    regionCode: chileRegionCode.trim(),
    channel: chileDeliveryChannel,
    totalGrams,
  })

  if (!quote) {
    return { ok: false, error: 'Región de envío no válida.' }
  }

  return {
    ok: true,
    clp: quote.clp,
    mode: `chile_${chileDeliveryChannel}_${quote.parcel.kind}x${quote.parcel.count}`,
  }
}

export async function getChileShippingQuoteDetails(input: {
  chileRegionCode: string
  chileDeliveryChannel: ChileDeliveryChannel
  cartItems: CartLineInput[]
}) {
  const ids = [...new Set(input.cartItems.map((l) => l.productId).filter(Boolean))]
  const { data: rows } = await supabaseServer
    .from('products')
    .select('id, net_content_ml, grams_per_ml, weight_override_g')
    .in('id', ids)

  const map = new Map<string, ProductShippingRow>(
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

  const totalGrams = totalCartGrams(input.cartItems, map)
  const quote = computeChileShippingClp({
    regionCode: input.chileRegionCode.trim(),
    channel: input.chileDeliveryChannel,
    totalGrams,
  })

  return { quote, totalGrams, map }
}
