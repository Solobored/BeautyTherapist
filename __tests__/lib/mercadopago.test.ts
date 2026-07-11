describe('Mercado Pago split payment helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'test-access-token'
  })

  it('sends marketplace_fee when a seller access token is provided', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'pref_123', init_point: 'https://mp.com/pay/pref_123' }),
      text: async () => '',
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const { createPreference } = require('@/lib/mercadopago')

    await createPreference({
      items: [{ title: 'Producto', quantity: 1, unit_price: 1000, currency_id: 'CLP' }],
      payer: { email: 'buyer@test.com' },
      back_urls: { success: 'https://example.com/success', failure: 'https://example.com/failure', pending: 'https://example.com/pending' },
      sellerAccessToken: 'seller-access-token',
      marketplaceFee: 5000,
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers.Authorization).toBe('Bearer seller-access-token')
    expect(JSON.parse(options.body as string)).toMatchObject({ marketplace_fee: 5000 })
  })

  it('uses the seller token for refund creation when provided', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 999, payment_id: 123, amount: 1000 }),
      text: async () => '',
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const { createRefund } = require('@/lib/mercadopago')

    await createRefund('payment_123', 1000, 'seller-access-token')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers.Authorization).toBe('Bearer seller-access-token')
  })
})
