import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseServer } from '@/lib/supabase';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object);
      break;

    default:
      // Unhandled event type
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    const { id, metadata, amount_received } = paymentIntent;

    // Get pending order created from checkout
    const { data: orders, error: orderError } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('payment_method', 'stripe')
      .eq('payment_status', 'pending')
      .eq('buyer_email', metadata.buyerEmail)
      .order('created_at', { ascending: false })
      .limit(1);

    if (orderError || !orders || orders.length === 0) {
      console.error('Order not found for payment intent:', id);
      return;
    }

    const order = orders[0];

    // Update order status to completed
    const { error: updateError } = await supabaseServer
      .from('orders')
      .update({
        payment_status: 'completed',
        order_status: 'processing',
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return;
    }

    // Decrement stock for each product in the order
    const items = order.items as Array<{ product_id: string; quantity: number }>;
    for (const item of items) {
      if (item.product_id) {
        // Get current stock
        const { data: product, error: fetchError } = await supabaseServer
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (!fetchError && product) {
          // Update stock
          await supabaseServer
            .from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.product_id);
        }
      }
    }

    // Send confirmation email via Resend
    try {
      await resend.emails.send({
        from: 'orders@beautytherapist.com',
        to: metadata.buyerEmail,
        subject: `Order Confirmation - #${order.id.substring(0, 8).toUpperCase()}`,
        html: `
          <h2>Thank you for your order!</h2>
          <p>Your order has been received and is being processed.</p>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Total:</strong> $${(order.total).toFixed(2)}</p>
          <p><strong>Status:</strong> Processing</p>
          <p>You will receive tracking information once your order ships.</p>
        `,
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the webhook if email fails
    }

    // If order is linked to a user, update their profile reference
    if (!order.user_id) {
      const { data: profile } = await supabaseServer
        .from('profiles')
        .select('id')
        .eq('email', metadata.buyerEmail)
        .single();

      if (profile) {
        await supabaseServer
          .from('orders')
          .update({ user_id: profile.id })
          .eq('id', order.id);
      }
    }

    // Increment coupon usage if applied
    if (metadata.couponCode && metadata.couponCode !== 'none') {
      const { data: coupon } = await supabaseServer
        .from('coupons')
        .select('used_count')
        .eq('code', metadata.couponCode)
        .single();

      if (coupon) {
        await supabaseServer
          .from('coupons')
          .update({ used_count: coupon.used_count + 1 })
          .eq('code', metadata.couponCode);
      }
    }

    console.log('Payment succeeded for order:', order.id);
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    const { id, metadata } = paymentIntent;

    // Update order status to failed
    const { data: orders } = await supabaseServer
      .from('orders')
      .select('*')
      .eq('buyer_email', metadata.buyerEmail)
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (orders && orders.length > 0) {
      const order = orders[0];

      await supabaseServer
        .from('orders')
        .update({
          payment_status: 'failed',
        })
        .eq('id', order.id);

      // Send failure email
      try {
        await resend.emails.send({
          from: 'orders@beautytherapist.com',
          to: metadata.buyerEmail,
          subject: 'Payment Failed - Please Try Again',
          html: `
            <h2>Payment Failed</h2>
            <p>Unfortunately, your payment could not be processed.</p>
            <p>Please try again or contact support if you need assistance.</p>
          `,
        });
      } catch (emailError) {
        console.error('Error sending failure email:', emailError);
      }

      console.log('Payment failed for order:', order.id);
    }
  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error);
  }
}
