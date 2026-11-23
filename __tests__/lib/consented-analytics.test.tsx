import { act, render, screen } from '@testing-library/react'
import { ConsentedAnalytics } from '@/components/consented-analytics'
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_KEY,
} from '@/lib/cookie-consent'

jest.mock('next/navigation', () => ({
  usePathname: () => '/shop',
}))

jest.mock('next/script', () => {
  const React = jest.requireActual('react')
  return {
    __esModule: true,
    default: ({ id, src }: { id?: string; src?: string }) =>
      React.createElement('span', { 'data-testid': src ? 'google-tag-script' : id }),
  }
})

jest.mock('@vercel/analytics/react', () => {
  const React = jest.requireActual('react')
  return {
    Analytics: () => React.createElement('span', { 'data-testid': 'vercel-analytics' }),
  }
})

describe('consented analytics', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('does not load analytics before consent', () => {
    const { container } = render(<ConsentedAnalytics />)

    expect(container).toBeEmptyDOMElement()
  })

  it('loads analytics after the visitor accepts', async () => {
    render(<ConsentedAnalytics />)

    await act(async () => {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ value: 'accepted' }))
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: 'accepted' }),
      )
    })

    expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument()
    expect(screen.getByTestId('google-analytics-bootstrap')).toBeInTheDocument()
    expect(screen.getByTestId('google-tag-script')).toBeInTheDocument()
  })

  it('updates Google consent when a visitor changes their choice', async () => {
    render(<ConsentedAnalytics />)
    await act(async () => {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ value: 'accepted' }))
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: 'accepted' }),
      )
    })

    const gtag = jest.fn()
    window.gtag = gtag

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: 'rejected' }),
      )
    })
    expect(gtag).toHaveBeenLastCalledWith('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: 'accepted' }),
      )
    })
    expect(gtag).toHaveBeenLastCalledWith('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  })
})
