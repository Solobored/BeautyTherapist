import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { createPaymentIntent, type CheckoutRequestBody } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();

    // Validate required fields
    if (!body.items || !body.buyerEmail || !body.total) {
      return NextResponse.json(
        { error: 'Missing required fields: items, buyerEmail, or total' },
        { status: 400 }
      );
    }

    if (body.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Check stock availability for each product
    for (const item of body.items) {
      const { data: product, error: productError } = await supabaseServer
        .from('products')
        .select('stock')
        .eq('id', item.productId)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${item.productName}. Available: ${product.stock}` },
          { status: 400 }
        );
      }
    }

    // Validate coupon if provided
    if (body.couponCode) {
      const { data: coupon, error: couponError } = await supabaseServer
        .from('coupons')
        .select('*')
        .eq('code', body.couponCode)
        .eq('is_active', true)
        .single();

      if (couponError || !coupon) {
        return NextResponse.json(
          { error: 'Invalid or expired coupon code' },
          { status: 400 }
        );
      }

      // Check minimum order amount
      if (coupon.min_order && body.subtotal < coupon.min_order) {
        return NextResponse.json(
          { error: `Minimum order amount is $${coupon.min_order} for this coupon` },
          { status: 400 }
        );
      }

      // Check max uses
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return NextResponse.json(
          { error: 'This coupon has reached its usage limit' },
          { status: 400 }
        );
      }

      // Check expiration
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'This coupon has expired' },
          { status: 400 }
        );
      }
    }

    // Create Stripe PaymentIntent
    const paymentIntentResponse = await createPaymentIntent(body);

    return NextResponse.json({
      clientSecret: paymentIntentResponse.clientSecret,
      paymentIntentId: paymentIntentResponse.paymentIntentId,
      amount: body.total,
      currency: 'usd',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
