jest.mock('@/lib/supabase', () => ({
  supabaseServer: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
  },
}))

jest.mock('@/lib/mercadopago', () => ({
  createPreference: jest.fn(),
}))

jest.mock('@/lib/mercadopago-oauth', () => ({
  getValidSellerAccessToken: jest.fn(),
}))

describe('checkout split payments behaviour', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'test-access-token'
    process.env.MARKETPLACE_COMMISSION_RATE = '0.005'
  })

  it('blocks mixed-brand carts before creating a preference', async () => {
    const { POST } = require('@/app/api/checkout/route')
    const { supabaseServer } = require('@/lib/supabase')
    const { createPreference } = require('@/lib/mercadopago')
    const { getValidSellerAccessToken } = require('@/lib/mercadopago-oauth')

    const supabaseMock = supabaseServer
    const formChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { stock: 10 }, error: null }),
      in: jest.fn().mockResolvedValue({ data: [{ id: 'prod-1', brand_id: 'brand-1' }, { id: 'prod-2', brand_id: 'brand-2' }], error: null }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      is: jest.fn().mockReturnThis(),
    }
    supabaseMock.from.mockImplementation(() => formChain)

    const response = await POST({
      json: async () => ({
        items: [
          { productId: 'prod-1', productName: 'Producto 1', productImage: '', quantity: 1, price: 1000 },
          { productId: 'prod-2', productName: 'Producto 2', productImage: '', quantity: 1, price: 1000 },
        ],
        buyerEmail: 'buyer@test.com',
        buyerName: 'Buyer',
        buyerPhone: '123',
        shippingAddress: { street: 'x', city: 'y', state: 'z', zip: '0000', country: 'CL' },
        subtotal: 2000,
        shippingCost: 0,
        discount: 0,
        total: 2000,
      }),
      headers: new Headers(),
    })

    expect(response.status).toBe(400)
    expect(createPreference).not.toHaveBeenCalled()
    expect(getValidSellerAccessToken).not.toHaveBeenCalled()
  })
})
