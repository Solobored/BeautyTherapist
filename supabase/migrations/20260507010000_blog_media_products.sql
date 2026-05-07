CREATE TABLE IF NOT EXISTS blog_post_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_post_products (
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (blog_post_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_post_images_post ON blog_post_images(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_products_post ON blog_post_products(blog_post_id);

ALTER TABLE blog_post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seller_manages_blog_images"
  ON blog_post_images FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM blog_posts bp
      JOIN brands b ON b.id = bp.brand_id
      WHERE bp.id = blog_post_images.blog_post_id
        AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM blog_posts bp
      JOIN brands b ON b.id = bp.brand_id
      WHERE bp.id = blog_post_images.blog_post_id
        AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "public_read_blog_images"
  ON blog_post_images FOR SELECT USING (true);

CREATE POLICY "public_read_blog_products"
  ON blog_post_products FOR SELECT USING (true);

CREATE POLICY "seller_manages_blog_products"
  ON blog_post_products FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM blog_posts bp
      JOIN brands b ON b.id = bp.brand_id
      WHERE bp.id = blog_post_products.blog_post_id
        AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM blog_posts bp
      JOIN brands b ON b.id = bp.brand_id
      WHERE bp.id = blog_post_products.blog_post_id
        AND b.owner_id = auth.uid()
    )
  );
