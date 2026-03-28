/**
 * Shipping helpers (CLP). Flat rates from env; optional distance estimate for Chile via geocoding.
 */

export type ShippingKind = 'national' | 'international'
export type NationalMode = 'flat' | 'distance'

export function parseClpEnv(value: string | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback
}

export function nationalFlatClp(): number {
  return parseClpEnv(
    process.env.SHIPPING_NATIONAL_CLP || process.env.NEXT_PUBLIC_SHIPPING_NATIONAL_CLP,
    5000
  )
}

export function internationalFlatClp(): number {
  return parseClpEnv(
    process.env.SHIPPING_INTERNATIONAL_CLP || process.env.NEXT_PUBLIC_SHIPPING_INTERNATIONAL_CLP,
    25000
  )
}

export function isChileCountry(country: string): boolean {
  const c = country.trim().toLowerCase()
  return c === 'chile' || c === 'cl' || c === 'republic of chile' || c === 'república de chile'
}

export function distanceQuoteEnabled(): boolean {
  return process.env.ENABLE_SHIPPING_DISTANCE_QUOTE === 'true'
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function shippingFromDistanceKm(km: number): number {
  const base = parseClpEnv(process.env.SHIPPING_DISTANCE_BASE_CLP, 3000)
  const perKm = parseClpEnv(process.env.SHIPPING_DISTANCE_PER_KM_CLP, 80)
  const max = parseClpEnv(process.env.SHIPPING_DISTANCE_MAX_CLP, 30000)
  const raw = base + Math.round(km * perKm)
  return Math.min(max, Math.max(base, raw))
}

export function warehouseCoords(): { lat: number; lng: number } {
  const lat = Number(process.env.SHIPPING_ORIGIN_LAT ?? '-33.4489')
  const lng = Number(process.env.SHIPPING_ORIGIN_LNG ?? '-70.6693')
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { lat: -33.4489, lng: -70.6693 }
  }
  return { lat, lng }
}

/**
 * Geocode a Chilean city/region (Nominatim). Respect OSM usage policy (low volume, identify app).
 */
export async function geocodeChileCity(city: string, state: string): Promise<{ lat: number; lon: number } | null> {
  const q = `${city}, ${state}, Chile`.trim()
  if (q.length < 4) return null

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'BeautyTherapyCheckout/1.0',
      Accept: 'application/json',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) return null
  const json = (await res.json()) as { lat?: string; lon?: string }[]
  if (!json?.length) return null
  const lat = Number(json[0].lat)
  const lon = Number(json[0].lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return { lat, lon }
}

export async function quoteNationalDistanceClp(
  city: string,
  state: string,
  country: string
): Promise<{ shippingClp: number; distanceKm: number } | null> {
  if (!distanceQuoteEnabled()) return null
  if (!isChileCountry(country)) return null

  const dest = await geocodeChileCity(city, state)
  if (!dest) return null

  const wh = warehouseCoords()
  const km = haversineKm(wh.lat, wh.lng, dest.lat, dest.lon)
  return { shippingClp: shippingFromDistanceKm(km), distanceKm: Math.round(km * 10) / 10 }
}

export async function resolveShippingClp(input: {
  shippingKind: ShippingKind
  nationalMode?: NationalMode
  shippingAddress: { city: string; state: string; country: string; lat?: number; lng?: number }
}): Promise<{ clp: number; mode: string }> {
  const { shippingKind, nationalMode = 'flat', shippingAddress } = input

  if (shippingKind === 'international') {
    return { clp: internationalFlatClp(), mode: 'international_flat' }
  }

  if (nationalMode === 'distance' && isChileCountry(shippingAddress.country)) {
    if (distanceQuoteEnabled()) {
      const lat = shippingAddress.lat
      const lng = shippingAddress.lng
      if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
        const wh = warehouseCoords()
        const km = haversineKm(wh.lat, wh.lng, lat, lng)
        return { clp: shippingFromDistanceKm(km), mode: 'national_distance_pin' }
      }
    }

    const q = await quoteNationalDistanceClp(
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.country
    )
    if (q) return { clp: q.shippingClp, mode: 'national_distance' }
    return { clp: nationalFlatClp(), mode: 'national_flat_fallback' }
  }

  return { clp: nationalFlatClp(), mode: 'national_flat' }
}
