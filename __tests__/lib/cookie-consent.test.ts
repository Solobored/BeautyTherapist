import { COOKIE_CONSENT_KEY, readStoredCookieConsent } from '@/lib/cookie-consent'
import { shouldTrackAnalyticsPath } from '@/lib/analytics'

describe('cookie consent storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('does not enable analytics without an explicit decision', () => {
    expect(readStoredCookieConsent()).toBeNull()
  })

  it.each(['accepted', 'rejected'] as const)('reads the %s decision', (value) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ value }))

    expect(readStoredCookieConsent()).toBe(value)
  })

  it('does not reuse consent given before Google Analytics was added', () => {
    localStorage.setItem('bt_cookie_consent_v1', JSON.stringify({ value: 'accepted' }))

    expect(readStoredCookieConsent()).toBeNull()
  })

  it('ignores malformed consent values', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ value: 'all' }))

    expect(readStoredCookieConsent()).toBeNull()
  })
})

describe('analytics page filtering', () => {
  it('allows public pages and excludes account, order, and checkout routes', () => {
    expect(shouldTrackAnalyticsPath('/shop/serum')).toBe(true)
    expect(shouldTrackAnalyticsPath('/account/settings')).toBe(false)
    expect(shouldTrackAnalyticsPath('/order-confirmation/123')).toBe(false)
    expect(shouldTrackAnalyticsPath('/checkout')).toBe(false)
  })
})
