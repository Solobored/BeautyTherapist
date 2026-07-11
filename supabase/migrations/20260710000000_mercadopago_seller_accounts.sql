CREATE TABLE IF NOT EXISTS mercadopago_seller_accounts (
  brand_id UUID PRIMARY KEY REFERENCES brands(id) ON DELETE CASCADE,
  mp_user_id TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  public_key TEXT,
  live_mode BOOLEAN NOT NULL DEFAULT false,
  scope TEXT,
  token_type TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_refreshed_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mp_seller_accounts_mp_user_id ON mercadopago_seller_accounts(mp_user_id);
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS mercadopago_marketplace_fee INTEGER,
  ADD COLUMN IF NOT EXISTS mercadopago_seller_brand_id UUID REFERENCES brands(id);
COMMENT ON COLUMN orders.mercadopago_marketplace_fee IS 'Comisión de la plataforma retenida en CLP para esta orden (0.5% del total)';
COMMENT ON COLUMN orders.mercadopago_seller_brand_id IS 'Brand/vendedor cuya cuenta de Mercado Pago recibió el pago';
ALTER TABLE mercadopago_seller_accounts ENABLE ROW LEVEL SECURITY;