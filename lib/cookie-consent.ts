export const COOKIE_CONSENT_KEY = 'bt_cookie_consent_v2'
export const COOKIE_CONSENT_CHANGED_EVENT = 'bt-cookie-consent-changed'
export const COOKIE_PREFERENCES_REQUESTED_EVENT = 'bt-cookie-preferences-requested'

export type CookieConsentValue = 'accepted' | 'rejected'

export function readStoredCookieConsent(): CookieConsentValue | null {
  const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!stored) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(stored)
  } catch (error) {
    console.error('Unable to parse the stored cookie consent.', error)
    return null
  }

  if (typeof parsed !== 'object' || parsed === null || !('value' in parsed)) return null
  return parsed.value === 'accepted' || parsed.value === 'rejected' ? parsed.value : null
}
