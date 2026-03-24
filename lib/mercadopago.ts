import crypto from 'node:crypto';

const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const mpIntegratorId = process.env.MERCADOPAGO_INTEGRATOR_ID;
const mpWebhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

if (!mpAccessToken) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN is not defined');
}

const MP_API_BASE = 'https://api.mercadopago.com';

type PreferenceItem = {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
  picture_url?: string;
};

type PreferencePayload = {
  items: PreferenceItem[];
  payer: {
    name?: string;
    email: string;
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  notification_url: string;
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  metadata?: Record<string, any>;
};

export type PreferenceResponse = {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
};

export type PaymentResponse = {
  id: number;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled' | 'in_process';
  status_detail?: string;
  external_reference?: string;
  metadata?: {
    order_id?: string;
    buyer_email?: string;
    coupon_code?: string;
  } & Record<string, any>;
  transaction_details?: {
    total_paid_amount?: number;
  };
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
};

function authHeaders() {
  return {
    Authorization: `Bearer ${mpAccessToken}`,
    'Content-Type': 'application/json',
    ...(mpIntegratorId ? { 'X-Integrator-Id': mpIntegratorId } : {}),
  };
}

export async function createPreference(payload: PreferencePayload): Promise<PreferenceResponse> {
  const res = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mercado Pago preference error: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getPayment(paymentId: string): Promise<PaymentResponse> {
  const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mercado Pago payment fetch error: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * Verify Mercado Pago webhook signature (HMAC SHA256).
 * @param rawBody Raw request body string
 * @param signatureHeader Header "x-signature" (expects ts=...,v1=...)
 * @param requestId Header "x-request-id"
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  requestId: string | null
): boolean {
  if (!mpWebhookSecret || !signatureHeader || !requestId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, v] = p.trim().split('=');
      return [k, v];
    })
  );

  const ts = parts['ts'];
  const v1 = parts['v1'];

  if (!ts || !v1) return false;

  const data = `${requestId}:${ts}:${rawBody}`;
  const expected = crypto.createHmac('sha256', mpWebhookSecret).update(data).digest('hex');
  return expected === v1;
}
