/**
 * Latin American countries data with capitals and coordinates
 */

export interface CountryData {
  code: string
  name: string
  capital: string
  lat: number
  lng: number
}

export const LATIN_AMERICA_COUNTRIES: CountryData[] = [
  {
    code: 'ar',
    name: 'Argentina',
    capital: 'Buenos Aires',
    lat: -34.6037,
    lng: -58.3816,
  },
  {
    code: 'br',
    name: 'Brasil',
    capital: 'Brasília',
    lat: -15.8267,
    lng: -47.8711,
  },
  {
    code: 'cl',
    name: 'Chile',
    capital: 'Santiago',
    lat: -33.4489,
    lng: -70.6693,
  },
  {
    code: 'co',
    name: 'Colombia',
    capital: 'Bogotá',
    lat: 4.7110,
    lng: -74.0721,
  },
  {
    code: 'ec',
    name: 'Ecuador',
    capital: 'Quito',
    lat: -0.2299,
    lng: -78.5099,
  },
  {
    code: 'mx',
    name: 'México',
    capital: 'Ciudad de México',
    lat: 19.4326,
    lng: -99.1332,
  },
  {
    code: 'pe',
    name: 'Perú',
    capital: 'Lima',
    lat: -12.0464,
    lng: -77.0428,
  },
  {
    code: 'uy',
    name: 'Uruguay',
    capital: 'Montevideo',
    lat: -34.9011,
    lng: -56.1645,
  },
]

export function getCountryByName(name: string): CountryData | undefined {
  const normalized = name.trim().toLowerCase()
  return LATIN_AMERICA_COUNTRIES.find(
    (c) => c.name.toLowerCase() === normalized || c.code.toLowerCase() === normalized
  )
}

export function getCountryByCode(code: string): CountryData | undefined {
  return LATIN_AMERICA_COUNTRIES.find((c) => c.code.toLowerCase() === code.toLowerCase())
}
