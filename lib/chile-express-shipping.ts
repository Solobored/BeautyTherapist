export type ChileExpressZone = 'rm' | 'sur' | 'norte' | 'extremo' | 'prioritario'

export interface ChileExpressRate {
  zone: ChileExpressZone
  label: string
  clp: number
  eta: string
  description: string
}

export const CHILE_EXPRESS_RATES: ChileExpressRate[] = [
  {
    zone: 'rm',
    label: 'Region Metropolitana',
    clp: 7000,
    eta: '1-2 dias habiles',
    description: 'Entrega en Santiago y comunas de la RM',
  },
  {
    zone: 'sur',
    label: 'Sur de Chile',
    clp: 9000,
    eta: '3-5 dias habiles',
    description: 'Regiones VI al X y XVI',
  },
  {
    zone: 'norte',
    label: 'Norte de Chile',
    clp: 10000,
    eta: '4-6 dias habiles',
    description: 'Regiones I, II, III, IV y XV',
  },
  {
    zone: 'extremo',
    label: 'Zona Extrema',
    clp: 16000,
    eta: '8-12 dias habiles',
    description: 'Regiones XI (Aysen) y XII (Magallanes)',
  },
  {
    zone: 'prioritario',
    label: 'Express / Prioritario',
    clp: 20000,
    eta: 'Mismo dia o siguiente',
    description: 'Servicio express dentro de la RM',
  },
]

export const REGION_TO_CHILE_EXPRESS_ZONE: Record<string, ChileExpressZone> = {
  rm: 'rm',
  metropolitana: 'rm',
  valparaiso: 'sur',
  ohiggins: 'sur',
  maule: 'sur',
  nuble: 'sur',
  biobio: 'sur',
  araucania: 'sur',
  los_rios: 'sur',
  los_lagos: 'sur',
  coquimbo: 'norte',
  atacama: 'norte',
  antofagasta: 'norte',
  tarapaca: 'norte',
  arica: 'norte',
  arica_parinacota: 'norte',
  aysen: 'extremo',
  magallanes: 'extremo',
}

export function getChileExpressRateForRegion(regionCode: string): ChileExpressRate | null {
  const zone = REGION_TO_CHILE_EXPRESS_ZONE[regionCode]
  if (!zone) return null
  return CHILE_EXPRESS_RATES.find((rate) => rate.zone === zone) ?? null
}

export function getChileExpressRateByZone(zone: ChileExpressZone): ChileExpressRate | null {
  return CHILE_EXPRESS_RATES.find((rate) => rate.zone === zone) ?? null
}
