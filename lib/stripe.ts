import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

// Initialize Stripe with the secret key for server-side operations
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20',
});

export type StripePaymentIntentResponse = {
  clientSecret: string;
  paymentIntentId: string;
  status: string;
};

export type CheckoutRequestBody = {
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
  }>;
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
  couponCode?: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
};

export async function createPaymentIntent(
  checkoutData: CheckoutRequestBody
): Promise<StripePaymentIntentResponse> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(checkoutData.total * 100), // Amount in cents
    currency: 'usd',
    metadata: {
      buyerEmail: checkoutData.buyerEmail,
      buyerName: checkoutData.buyerName,
      couponCode: checkoutData.couponCode || 'none',
    },
    description: `Order for ${checkoutData.buyerName}`,
  });

  return {
    clientSecret: paymentIntent.client_secret || '',
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
  };
}
