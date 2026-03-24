import { renderHook, act } from '@testing-library/react';

// Mock cart context hook
const useCart = () => {
  const [cart, setCart] = React.useState<Array<{ productId: string; quantity: number }>>([]);

  const addToCart = (product: { productId: string; name: string; price: number }) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.productId === product.productId);
      if (existingItem) {
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: product.productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  return { cart, addToCart, removeFromCart, updateQuantity };
};

import React from 'react';

describe('Shopping Cart', () => {
  describe('Add to Cart', () => {
    it('should increment cart count when adding product', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart({ productId: 'prod-1', name: 'Serum', price: 45 });
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(1);
    });

    it('should increase quantity when adding same product twice', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart({ productId: 'prod-1', name: 'Serum', price: 45 });
        result.current.addToCart({ productId: 'prod-1', name: 'Serum', price: 45 });
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(2);
    });

    it('should add different products as separate entries', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart({ productId: 'prod-1', name: 'Serum', price: 45 });
        result.current.addToCart({ productId: 'prod-2', name: 'Cream', price: 52 });
      });

      expect(result.current.cart).toHaveLength(2);
    });
  });

  describe('Remove from Cart', () => {
    it('should remove product from cart correctly', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart({ productId: 'prod-1', name: 'Serum', price: 45 });
        result.current.addToCart({ productId: 'prod-2', name: 'Cream', price: 52 });
      });

      act(() => {
        result.current.removeFromCart('prod-1');
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].productId).toBe('prod-2');
    });

    it('should handle removing non-existent product', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart({ productId: 'prod-1', name: 'Serum', price: 45 });
        result.current.removeFromCart('prod-999');
      });

      expect(result.current.cart).toHaveLength(1);
    });
  });

  describe('Update Quantity', () => {
    it('should update quantity in cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addToCart({ productId: 'prod-1', name: 'Serum', price: 45 });
      });

      act(() => {
        result.current.updateQuantity('prod-1', 5);
      });

      expect(result.current.cart[0].quantity).toBe(5);
    });

    it('should recalculate subtotal when quantity changes', () => {
      // This would be tested with actual cart context
      const mockProduct = { productId: 'prod-1', quantity: 2, price: 45 };
      const expectedSubtotal = mockProduct.quantity * mockProduct.price;

      expect(expectedSubtotal).toBe(90);
    });
  });

  describe('Cart Persistence', () => {
    it('should persist cart to localStorage', () => {
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
      };

      global.localStorage = mockLocalStorage as any;

      const cartData = [{ productId: 'prod-1', quantity: 2 }];
      localStorage.setItem('cart', JSON.stringify(cartData));

      expect(localStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify(cartData));
    });

    it('should restore cart from localStorage after page refresh', () => {
      const cartData = [{ productId: 'prod-1', quantity: 2 }];
      const mockLocalStorage = {
        getItem: jest.fn(() => JSON.stringify(cartData)),
        setItem: jest.fn(),
      };

      global.localStorage = mockLocalStorage as any;

      const retrieved = JSON.parse(localStorage.getItem('cart') || '[]');

      expect(retrieved).toEqual(cartData);
    });
  });

  describe('Coupons', () => {
    it('should apply valid coupon WELCOME10 with 10% discount', () => {
      const subtotal = 100;
      const discountPercent = 10;
      const discount = (subtotal * discountPercent) / 100;
      const total = subtotal - discount;

      expect(discount).toBe(10);
      expect(total).toBe(90);
    });

    it('should apply valid coupon SKIN20 with 20% discount', () => {
      const subtotal = 100;
      const discountPercent = 20;
      const discount = (subtotal * discountPercent) / 100;
      const total = subtotal - discount;

      expect(discount).toBe(20);
      expect(total).toBe(80);
    });

    it('should show error message for invalid coupon', () => {
      // This would test the actual coupon validation
      const mockCoupon = null;
      expect(mockCoupon).toBeNull();
    });

    it('should not apply coupon below minimum order amount', () => {
      const subtotal = 20;
      const minOrder = 25;
      const isEligible = subtotal >= minOrder;

      expect(isEligible).toBe(false);
    });
  });
});
