ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS per_user_limit INT NOT NULL DEFAULT 1;

ALTER TABLE coupons
  DROP CONSTRAINT IF EXISTS coupons_discount_type_check;

ALTER TABLE coupons
  ADD CONSTRAINT coupons_discount_type_check
  CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping'));

UPDATE coupons
SET title = COALESCE(NULLIF(title, ''), code)
WHERE title IS NULL OR title = '';

CREATE INDEX IF NOT EXISTS idx_coupons_brand_id ON coupons(brand_id);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'used', 'released')),
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_redemptions_order_id_unique
  ON coupon_redemptions(order_id)
  WHERE order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_user_active
  ON coupon_redemptions(coupon_id, user_id)
  WHERE user_id IS NOT NULL AND status IN ('reserved', 'used');

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_email_active
  ON coupon_redemptions(coupon_id, lower(buyer_email))
  WHERE user_id IS NULL AND status IN ('reserved', 'used');

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id
  ON coupon_redemptions(coupon_id);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_status
  ON coupon_redemptions(status);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'coupon_redemptions'
      AND policyname = 'Only service role can manage coupon redemptions'
  ) THEN
    CREATE POLICY "Only service role can manage coupon redemptions"
      ON coupon_redemptions
      USING (false)
      WITH CHECK (false);
  END IF;
END $$;
