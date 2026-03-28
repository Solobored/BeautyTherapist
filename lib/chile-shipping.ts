/**
 * Tarifas referenciales Chile (XS ≤0,5 kg · S ≤3 kg por bulto; varios bultos S si supera 3 kg).
 * Domicilio vs retiro en punto (Blue Express u operador equivalente).
 */

export type ChileDeliveryChannel = 'domicilio' | 'punto'

export type ChileRegionCode =
  | 'rm'
  | 'atacama'
  | 'coquimbo'
  | 'valparaiso'
  | 'ohiggins'
  | 'maule'
  | 'nuble'
  | 'biobio'
  | 'araucania'
  | 'los_rios'
  | 'los_lagos'
  | 'antofagasta'
  | 'tarapaca'
  | 'arica'
  | 'aysen'
  | 'magallanes'

export type ChileRateRow = {
  code: ChileRegionCode
  label: string
  zone: string
  xsDomicilio: number
  sDomicilio: number
  xsPunto: number
  sPunto: number
  eta: string
}

/** Valores entregados (CLP) según tu tabla. */
export const CHILE_SHIPPING_REGIONS: ChileRateRow[] = [
  {
    code: 'rm',
    label: 'Región Metropolitana · Santiago',
    zone: 'Local',
    xsDomicilio: 3100,
    sDomicilio: 4200,
    xsPunto: 2600,
    sPunto: 3700,
    eta: '~2 días',
  },
  {
    code: 'atacama',
    label: 'III Región de Atacama · Copiapó',
    zone: 'Centro-norte',
    xsDomicilio: 4300,
    sDomicilio: 5600,
    xsPunto: 3800,
    sPunto: 5100,
    eta: '~2 días',
  },
  {
    code: 'coquimbo',
    label: 'IV Región de Coquimbo · La Serena',
    zone: 'Centro-norte',
    xsDomicilio: 4300,
    sDomicilio: 5600,
    xsPunto: 3800,
    sPunto: 5100,
    eta: '~2 días',
  },
  {
    code: 'valparaiso',
    label: 'V Región de Valparaíso · Valparaíso',
    zone: 'Centro',
    xsDomicilio: 4300,
    sDomicilio: 5600,
    xsPunto: 3800,
    sPunto: 5100,
    eta: '~2 días',
  },
  {
    code: 'ohiggins',
    label: 'VI Región del Libertador Gral. Bernardo O\'Higgins · Rancagua',
    zone: 'Centro',
    xsDomicilio: 4300,
    sDomicilio: 5600,
    xsPunto: 3800,
    sPunto: 5100,
    eta: '~2 días',
  },
  {
    code: 'maule',
    label: 'VII Región del Maule · Talca',
    zone: 'Centro',
    xsDomicilio: 4300,
    sDomicilio: 5600,
    xsPunto: 3800,
    sPunto: 5100,
    eta: '~2 días',
  },
  {
    code: 'nuble',
    label: 'XVI Región de Ñuble · Chillán',
    zone: 'Centro',
    xsDomicilio: 4300,
    sDomicilio: 5600,
    xsPunto: 3800,
    sPunto: 5100,
    eta: '~2 días',
  },
  {
    code: 'biobio',
    label: 'VIII Región del Biobío · Concepción',
    zone: 'Centro',
    xsDomicilio: 4300,
    sDomicilio: 5600,
    xsPunto: 3800,
    sPunto: 5100,
    eta: '~2 días',
  },
  {
    code: 'araucania',
    label: 'IX Región de La Araucanía · Temuco',
    zone: 'Centro-sur',
    xsDomicilio: 4300,
    sDomicilio: 5600,
    xsPunto: 3800,
    sPunto: 5100,
    eta: '~2 días',
  },
  {
    code: 'los_rios',
    label: 'XIV Región de Los Ríos · Valdivia',
    zone: 'Centro-sur',
    xsDomicilio: 4300,
    sDomicilio: 5600,
    xsPunto: 3800,
    sPunto: 5100,
    eta: '~2 días',
  },
  {
    code: 'los_lagos',
    label: 'X Región de Los Lagos · Puerto Montt',
    zone: 'Centro-sur',
    xsDomicilio: 4300,
    sDomicilio: 5600,
    xsPunto: 3800,
    sPunto: 5100,
    eta: '~2 días',
  },
  {
    code: 'antofagasta',
    label: 'II Región de Antofagasta · Antofagasta',
    zone: 'Norte lejano',
    xsDomicilio: 5200,
    sDomicilio: 9500,
    xsPunto: 4700,
    sPunto: 9000,
    eta: '~4 días',
  },
  {
    code: 'tarapaca',
    label: 'I Región de Tarapacá · Iquique',
    zone: 'Norte lejano',
    xsDomicilio: 5200,
    sDomicilio: 9500,
    xsPunto: 4700,
    sPunto: 9000,
    eta: '~4 días',
  },
  {
    code: 'arica',
    label: 'XV Región de Arica y Parinacota · Arica',
    zone: 'Norte lejano',
    xsDomicilio: 5200,
    sDomicilio: 9500,
    xsPunto: 4700,
    sPunto: 9000,
    eta: '~5 días',
  },
  {
    code: 'aysen',
    label: 'XI Región de Aysén · Coyhaique',
    zone: 'Extremo sur',
    xsDomicilio: 5200,
    sDomicilio: 9500,
    xsPunto: 4700,
    sPunto: 9000,
    eta: '~10 días',
  },
  {
    code: 'magallanes',
    label: 'XII Región de Magallanes · Punta Arenas',
    zone: 'Extremo sur',
    xsDomicilio: 5200,
    sDomicilio: 9500,
    xsPunto: 4700,
    sPunto: 9000,
    eta: '~12 días',
  },
]

const XS_MAX_G = 500
const S_MAX_G = 3000

const DEFAULT_GRAMS_IF_EMPTY = 50

export function getChileRegionRow(code: string): ChileRateRow | null {
  return CHILE_SHIPPING_REGIONS.find((r) => r.code === code) ?? null
}

/** Gramos de una unidad de producto para envío. */
export function gramsPerProductUnit(input: {
  net_content_ml: number | null | undefined
  grams_per_ml: number | null | undefined
  weight_override_g: number | null | undefined
}): number {
  const override = input.weight_override_g != null ? Number(input.weight_override_g) : null
  if (override != null && Number.isFinite(override) && override > 0) {
    return Math.round(override * 100) / 100
  }
  const ml = input.net_content_ml != null ? Number(input.net_content_ml) : 0
  const density = input.grams_per_ml != null ? Number(input.grams_per_ml) : 1
  if (!Number.isFinite(ml) || ml <= 0) {
    return DEFAULT_GRAMS_IF_EMPTY
  }
  const g = ml * (Number.isFinite(density) && density > 0 ? density : 1)
  return Math.max(DEFAULT_GRAMS_IF_EMPTY, Math.round(g * 100) / 100)
}

export type ProductShippingRow = {
  id: string
  net_content_ml: number | null
  grams_per_ml: number | null
  weight_override_g: number | null
}

export function totalCartGrams(
  items: { productId: string; quantity: number }[],
  productsById: Map<string, ProductShippingRow>
): number {
  let total = 0
  for (const line of items) {
    const p = productsById.get(line.productId)
    const g = p ? gramsPerProductUnit(p) : DEFAULT_GRAMS_IF_EMPTY
    const q = Math.max(0, Math.floor(line.quantity))
    total += g * q
  }
  return Math.round(total * 100) / 100
}

/**
 * Desglose de bultos: XS hasta 500 g; S hasta 3000 g; si pasa, varios bultos S.
 */
export function estimateChileParcels(totalGrams: number): { kind: 'XS' | 'S'; count: number; label: string } {
  const g = Math.max(0, totalGrams)
  if (g <= XS_MAX_G) {
    return { kind: 'XS', count: 1, label: 'Bulto XS (hasta 0,5 kg)' }
  }
  if (g <= S_MAX_G) {
    return { kind: 'S', count: 1, label: 'Bulto S (hasta 3 kg)' }
  }
  const n = Math.ceil(g / S_MAX_G)
  return { kind: 'S', count: n, label: `${n} bultos S (hasta 3 kg c/u)` }
}

function rateForParcel(
  row: ChileRateRow,
  channel: ChileDeliveryChannel,
  kind: 'XS' | 'S'
): number {
  if (channel === 'punto') {
    return kind === 'XS' ? row.xsPunto : row.sPunto
  }
  return kind === 'XS' ? row.xsDomicilio : row.sDomicilio
}

export function computeChileShippingClp(input: {
  regionCode: string
  channel: ChileDeliveryChannel
  totalGrams: number
}): {
  clp: number
  region: ChileRateRow
  channel: ChileDeliveryChannel
  totalGrams: number
  parcel: ReturnType<typeof estimateChileParcels>
} | null {
  const row = getChileRegionRow(input.regionCode)
  if (!row) return null
  const parcel = estimateChileParcels(input.totalGrams)
  const unitRate = rateForParcel(row, input.channel, parcel.kind)
  const clp = unitRate * parcel.count
  return {
    clp,
    region: row,
    channel: input.channel,
    totalGrams: input.totalGrams,
    parcel,
  }
}
