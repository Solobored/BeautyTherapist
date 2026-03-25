import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { getPayment, verifyWebhookSignature } from '@/lib/mercadopago';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-signature');
  const requestId = request.headers.get('x-request-id');

  if (!verifyWebhookSignature(rawBody, signature, requestId)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const paymentId = payload?.data?.id || payload?.resource?.id;

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment id' }, { status: 400 });
  }

  try {
    const payment = await getPayment(String(paymentId));
    const orderId = payment.metadata?.order_id || payment.external_reference;
    const buyerEmail = payment.metadata?.buyer_email || payment.payer?.email;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    if (payment.status === 'approved') {
      await handlePaymentApproved(orderId, buyerEmail);
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      await handlePaymentFailed(orderId, buyerEmail);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Mercado Pago webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentApproved(orderId: string, buyerEmail?: string) {
  // Fetch the order
  const { data: order, error: orderError } = await supabaseServer
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error('Order not found for approved payment:', orderId);
    return;
  }

  // Update order status
  const { error: updateError } = await supabaseServer
    .from('orders')
    .update({
      payment_status: 'completed',
      order_status: 'processing',
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order status:', updateError);
    return;
  }

  // Decrement stock
  const items = order.items as Array<{ product_id: string; quantity: number }>;
  for (const item of items) {
    if (item.product_id) {
      const { data: product, error: fetchError } = await supabaseServer
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (!fetchError && product) {
        await supabaseServer
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.product_id);
      }
    }
  }

  // Increment coupon usage if applied
  if (order.coupon_code) {
    const { data: coupon } = await supabaseServer
      .from('coupons')
      .select('used_count')
      .eq('code', order.coupon_code)
      .single();

    if (coupon) {
      await supabaseServer
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('code', order.coupon_code);
    }
  }

  // Send confirmation email
  if (buyerEmail) {
    try {
      await resend.emails.send({
        from: 'orders@beautytherapist.com',
        to: buyerEmail,
        subject: `Order Confirmation - #${orderId.substring(0, 8).toUpperCase()}`,
        html: `
          <h2>Thank you for your order!</h2>
          <p>Your order has been received and is being processed.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Total:</strong> $${(order.total).toFixed(2)}</p>
          <p><strong>Status:</strong> Processing</p>
        `,
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }
  }
}

async function handlePaymentFailed(orderId: string, buyerEmail?: string) {
  const { error } = await supabaseServer
    .from('orders')
    .update({ payment_status: 'failed' })
    .eq('id', orderId);

  if (error) {
    console.error('Error marking order failed:', error);
  }

  if (buyerEmail) {
    try {
      await resend.emails.send({
        from: 'orders@beautytherapist.com',
        to: buyerEmail,
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
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for webhooks.' },
    { status: 405 }
  );
}
