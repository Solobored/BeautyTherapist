-- Mercado Pago references & refunds (used by checkout, webhooks, seller cancel)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS mercadopago_preference_id TEXT,
  ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS mercadopago_refund_id TEXT;

COMMENT ON COLUMN orders.mercadopago_preference_id IS 'Checkout Pro preference id';
COMMENT ON COLUMN orders.mercadopago_payment_id IS 'MP payment id when approved';
COMMENT ON COLUMN orders.mercadopago_refund_id IS 'MP refund id when reimbursed';
