'use client';

import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
  amount: number;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export function StripePaymentForm({
  amount,
  buyerEmail,
  buyerName,
  buyerPhone,
  shippingAddress,
  items,
  subtotal,
  shippingCost,
  discount,
  couponCode,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is not loaded');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create checkout data
      const checkoutData = {
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          productImage: '', // This would be set in real implementation
        })),
        buyerEmail,
        buyerName,
        buyerPhone,
        shippingAddress,
        couponCode,
        subtotal,
        shippingCost,
        discount,
        total: amount,
      };

      // 2. Get PaymentIntent from backend
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const { clientSecret } = await checkoutResponse.json();

      // 3. Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: buyerName,
            email: buyerEmail,
            phone: buyerPhone,
          },
        },
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
        onError?.(result.error.message || 'Payment failed');
        toast.error(`Payment failed: ${result.error.message}`);
      } else if (result.paymentIntent?.status === 'succeeded') {
        setSuccess(true);
        toast.success('Payment successful!');
        // Redirect to order confirmation after a short delay
        setTimeout(() => {
          const orderId = result.paymentIntent?.id;
          onSuccess?.(orderId || '');
          window.location.href = `/order-confirmation?paymentIntent=${orderId}`;
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Payment successful! Redirecting to order confirmation...
          </AlertDescription>
        </Alert>
      )}

      {/* Card Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Card Details</label>
        <div className="border rounded-lg p-3 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#fa755a',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {shippingCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>${amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !elements || loading || success}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Processing payment...
          </>
        ) : success ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Payment Successful
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-xs text-gray-500 text-center">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}
