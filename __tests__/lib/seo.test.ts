import { buildMerchantReturnPolicy } from '@/lib/seo'

describe('merchant return policy structured data', () => {
  it('matches the published return window without inventing shipping terms', () => {
    const policy = buildMerchantReturnPolicy()

    expect(policy).toMatchObject({
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'CL',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 10,
    })
    expect(policy).not.toHaveProperty('returnMethod')
    expect(policy).not.toHaveProperty('returnFees')
  })
})
