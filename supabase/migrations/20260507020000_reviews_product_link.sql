CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  referenced_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS referenced_product_id UUID REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_referenced_product ON reviews(referenced_product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_brand ON reviews(brand_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "public_insert_reviews" ON reviews FOR INSERT WITH CHECK (true);
