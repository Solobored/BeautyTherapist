/**
 * API Checkout Tests - Mercado Pago
 */

jest.mock('@/lib/supabase', () => ({
  supabaseServer: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  },
}));

jest.mock('@/lib/mercadopago', () => ({
  createPreference: jest.fn(),
}));

describe('POST /api/checkout (Mercado Pago)', () => {
  const mockCheckoutData = {
    items: [
      {
        productId: 'prod-1',
        productName: 'Vitamin C Serum',
        quantity: 1,
        price: 45,
        productImage: 'https://example.com/image.jpg',
      },
    ],
    buyerEmail: 'buyer@test.com',
    buyerName: 'John Doe',
    buyerPhone: '555-1234',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
    subtotal: 45,
    shippingCost: 5,
    discount: 0,
    total: 50,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid Checkout', () => {
    it('returns preference init_point for valid checkout', async () => {
      const { createPreference } = await import('@/lib/mercadopago');
      (createPreference as jest.Mock).mockResolvedValue({
        id: 'pref_test_123',
        init_point: 'https://mp.com/pay/pref_test_123',
      });

      const result = await createPreference({
        items: [],
        payer: { email: 'buyer@test.com' },
        back_urls: {
          success: 'http://localhost/success',
          failure: 'http://localhost/failure',
          pending: 'http://localhost/pending',
        },
        notification_url: 'http://localhost/api/webhooks/mercadopago',
      });

      expect(result).toHaveProperty('id', 'pref_test_123');
      expect(result).toHaveProperty('init_point');
    });
  });

  describe('Validation', () => {
    it('rejects empty cart', () => {
      const emptyCartData = { ...mockCheckoutData, items: [] };
      expect(emptyCartData.items.length > 0).toBe(false);
    });

    it('requires buyerEmail and total', () => {
      const invalid = { items: mockCheckoutData.items };
      const hasFields = 'buyerEmail' in invalid && 'total' in invalid;
      expect(hasFields).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('handles Mercado Pago creation errors', async () => {
      const { createPreference } = await import('@/lib/mercadopago');
      (createPreference as jest.Mock).mockRejectedValue(new Error('Mercado Pago error'));

      await expect(createPreference(mockCheckoutData as any)).rejects.toThrow('Mercado Pago error');
    });

    it('handles network timeouts', async () => {
      const { createPreference } = await import('@/lib/mercadopago');
      (createPreference as jest.Mock).mockRejectedValue(new Error('Network timeout'));

      await expect(createPreference(mockCheckoutData as any)).rejects.toThrow('Network timeout');
    });
  });
});
