CREATE TABLE IF NOT EXISTS seller_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  featured_product_ids UUID[] DEFAULT '{}',
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_videos_seller ON seller_videos(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_videos_active ON seller_videos(active, created_at DESC);

ALTER TABLE seller_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_videos"
  ON seller_videos FOR SELECT USING (active = true);

CREATE POLICY "seller_manages_videos"
  ON seller_videos FOR ALL
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());
