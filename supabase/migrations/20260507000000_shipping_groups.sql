CREATE TABLE IF NOT EXISTS shipping_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  carrier TEXT NOT NULL DEFAULT 'custom'
    CHECK (carrier IN ('blue_express', 'chile_express', 'custom')),
  rate_rm INTEGER,
  rate_sur INTEGER,
  rate_norte INTEGER,
  rate_extremo INTEGER,
  rate_prioritario INTEGER,
  free_shipping_threshold INTEGER,
  eta_rm TEXT DEFAULT '1-2 dias habiles',
  eta_sur TEXT DEFAULT '3-5 dias habiles',
  eta_norte TEXT DEFAULT '4-6 dias habiles',
  eta_extremo TEXT DEFAULT '8-12 dias habiles',
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_shipping_groups (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  shipping_group_id UUID NOT NULL REFERENCES shipping_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, shipping_group_id)
);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shipping_mode TEXT NOT NULL DEFAULT 'blue_express'
  CHECK (shipping_mode IN ('blue_express', 'chile_express', 'custom_group'));

CREATE INDEX IF NOT EXISTS idx_shipping_groups_seller ON shipping_groups(seller_id);
CREATE INDEX IF NOT EXISTS idx_product_shipping_groups_product ON product_shipping_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_product_shipping_groups_group ON product_shipping_groups(shipping_group_id);

ALTER TABLE shipping_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_shipping_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seller_owns_shipping_groups"
  ON shipping_groups FOR ALL
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "seller_manages_product_shipping"
  ON product_shipping_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN brands b ON b.id = p.brand_id
      WHERE p.id = product_shipping_groups.product_id
        AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN brands b ON b.id = p.brand_id
      WHERE p.id = product_shipping_groups.product_id
        AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "public_read_active_shipping_groups"
  ON shipping_groups FOR SELECT
  USING (active = true);

CREATE POLICY "public_read_product_shipping_groups"
  ON product_shipping_groups FOR SELECT
  USING (true);
