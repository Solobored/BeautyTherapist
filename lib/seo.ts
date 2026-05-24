import { nationalFlatClp } from '@/lib/shipping'
import { toAbsoluteUrl } from '@/lib/site-url'

const RETURN_DAYS = 30

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
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
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
    name: 'Beauty & Therapy',
    url: toAbsoluteUrl('/'),
    inLanguage: 'es-CL',
  }
}
