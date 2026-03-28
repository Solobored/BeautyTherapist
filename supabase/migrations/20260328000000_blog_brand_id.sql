-- Link blog posts to a brand so sellers can manage their own content from the dashboard.
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_brand_id ON blog_posts(brand_id);
