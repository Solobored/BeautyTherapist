import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
// import { createPreference } from '@/lib/mercadopago'; // TODO: Uncomment when Mercado Pago is configured

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

    // Create pending order record
    const { data: order, error: orderError } = await supabaseServer
      .from('orders')
      .insert({
        buyer_email: body.buyerEmail,
        buyer_name: body.buyerName,
        buyer_phone: body.buyerPhone,
        shipping_address: body.shippingAddress,
        items: body.items.map((item) => ({
          product_id: item.productId,
          product_name: item.productName,
          product_image: item.productImage,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: body.subtotal,
        shipping_cost: body.shippingCost,
        discount: body.discount,
        total: body.total,
        payment_method: 'mercadopago',
        payment_status: 'pending',
        order_status: 'pending',
        coupon_code: body.couponCode || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Unable to create order' },
        { status: 500 }
      );
    }

    // Build Mercado Pago preference payload
    // TODO: Re-enable after implementing Mercado Pago integration
    const items = body.items.map((item) => ({
      title: item.productName,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'USD',
      picture_url: item.productImage,
    }));

    if (body.shippingCost > 0) {
      items.push({
        title: 'Shipping',
        quantity: 1,
        unit_price: body.shippingCost,
        currency_id: 'USD',
      });
    }

    if (body.discount > 0) {
      items.push({
        title: 'Discount',
        quantity: 1,
        unit_price: -Math.abs(body.discount),
        currency_id: 'USD',
      });
    }

    // TODO: Uncomment when Mercado Pago is configured
    // const preference = await createPreference({
    //   items,
    //   payer: {
    //     name: body.buyerName,
    //     email: body.buyerEmail,
    //   },
    //   back_urls: {
    //     success: `${appUrl}/order-confirmation?order=${order.id}`,
    //     failure: `${appUrl}/checkout?status=failure&order=${order.id}`,
    //     pending: `${appUrl}/checkout?status=pending&order=${order.id}`,
    //   },
    //   notification_url: `${appUrl}/api/webhooks/mercadopago`,
    //   auto_return: 'approved',
    //   external_reference: order.id,
    //   metadata: {
    //     order_id: order.id,
    //     buyer_email: body.buyerEmail,
    //     coupon_code: body.couponCode || '',
    //   },
    // });

    // Placeholder response - Mercado Pago integration disabled
    console.warn('Mercado Pago integration is disabled. Order created but payment integration not available.');
    
    return NextResponse.json({
      preferenceId: `placeholder-${order.id}`,
      initPoint: null,
      orderId: order.id,
      message: 'Order created. Payment integration will be available soon.',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a checkout.' },
    { status: 405 }
  );
}
