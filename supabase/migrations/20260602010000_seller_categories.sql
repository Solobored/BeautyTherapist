CREATE TABLE IF NOT EXISTS seller_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (brand_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_seller_categories_brand_id
  ON seller_categories(brand_id);

ALTER TABLE seller_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can read their own categories"
  ON seller_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM brands
      WHERE brands.id = seller_categories.brand_id
        AND brands.owner_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can create their own categories"
  ON seller_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM brands
      WHERE brands.id = seller_categories.brand_id
        AND brands.owner_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update their own categories"
  ON seller_categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM brands
      WHERE brands.id = seller_categories.brand_id
        AND brands.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM brands
      WHERE brands.id = seller_categories.brand_id
        AND brands.owner_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete their own categories"
  ON seller_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM brands
      WHERE brands.id = seller_categories.brand_id
        AND brands.owner_id = auth.uid()
    )
  );
