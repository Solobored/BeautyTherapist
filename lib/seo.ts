import { nationalFlatClp } from '@/lib/shipping'
import { toAbsoluteUrl } from '@/lib/site-url'

const RETURN_DAYS = 10

export function buildOfferShippingDetails() {
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: nationalFlatClp(),
      currency: 'CLP',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'CL',
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 2,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 5,
        unitCode: 'DAY',
      },
    },
  }
}

export function buildMerchantReturnPolicy() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'CL',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: RETURN_DAYS,
  }
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Beauty & Therapy',
    url: toAbsoluteUrl('/'),
    logo: toAbsoluteUrl('/apple-icon.png'),
    image: toAbsoluteUrl('/apple-icon.png'),
    hasMerchantReturnPolicy: buildMerchantReturnPolicy(),
  }
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${toAbsoluteUrl('/')}#website`,
    name: 'Beauty & Therapy',
    url: toAbsoluteUrl('/'),
    inLanguage: 'es-CL',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${toAbsoluteUrl('/shop')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  }
}

type BrandSchemaInput = {
  name: string
  slug: string
  description?: string
  logo?: string
  banner?: string
  sameAs?: (string | undefined)[]
  products?: { id: string; name: string; image?: string; price: number; inStock: boolean }[]
}

/** Página de marca: Organization + ItemList de productos (rich results y mejor contexto para Google). */
export function buildBrandSchema(brand: BrandSchemaInput) {
  const url = toAbsoluteUrl(`/brands/${brand.slug}`)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Brand',
        '@id': `${url}#brand`,
        name: brand.name,
        url,
        description: brand.description || undefined,
        logo: brand.logo ? toAbsoluteUrl(brand.logo) : undefined,
        image: brand.banner ? toAbsoluteUrl(brand.banner) : undefined,
        sameAs: (brand.sameAs ?? []).filter(Boolean),
      },
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        url,
        name: `${brand.name} | Beauty & Therapy`,
        inLanguage: 'es-CL',
        isPartOf: { '@id': `${toAbsoluteUrl('/')}#website` },
        about: { '@id': `${url}#brand` },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: (brand.products ?? []).slice(0, 24).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: toAbsoluteUrl(`/shop/${p.id}`),
            name: p.name,
          })),
        },
      },
    ],
  }
}

/** Serializa JSON-LD de forma segura para inyectar en <script> (evita cerrar la etiqueta con "</"). */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
