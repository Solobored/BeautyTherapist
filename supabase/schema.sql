-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Users profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('buyer', 'seller')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Seller server-side auth credentials
CREATE TABLE seller_auth_credentials (
  seller_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash TEXT NOT NULL,
  password_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Seller server-side auth sessions
CREATE TABLE seller_auth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Seller brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  brand_slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  ingredients TEXT,
  how_to_use TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  stock INT NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  net_content_ml NUMERIC(10, 2),
  grams_per_ml NUMERIC(10, 4) NOT NULL DEFAULT 1,
  weight_override_g NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Product images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Buyer addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip TEXT NOT NULL,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE
  SET NULL,
    shipping_address JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
      payment_status IN ('pending', 'completed', 'failed', 'cancelled')
    ),
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (
      order_status IN (
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      )
    ),
    coupon_code TEXT,
    mercadopago_preference_id TEXT,
    mercadopago_payment_id TEXT,
    mercadopago_refund_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE
  SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (
    discount_type IN ('percentage', 'fixed', 'free_shipping')
  ),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order DECIMAL(10, 2),
  max_uses INT,
  used_count INT DEFAULT 0,
  per_user_limit INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE
  SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE
  SET NULL,
    buyer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'used', 'released')),
    reserved_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Wishlist
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
-- Blog posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content_es TEXT NOT NULL,
  content_en TEXT NOT NULL,
  cover_image TEXT,
  category TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Product Reviews
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE
  SET NULL,
    reviewer_name TEXT NOT NULL,
    reviewer_email TEXT,
    rating INT NOT NULL CHECK (
      rating >= 1
      AND rating <= 5
    ),
    title TEXT,
    content TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT false,
    helpful_count INT DEFAULT 0,
    unhelpful_count INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_seller_auth_credentials_email ON seller_auth_credentials(email);
CREATE INDEX idx_seller_auth_sessions_seller_id ON seller_auth_sessions(seller_id);
CREATE INDEX idx_brands_owner_id ON brands(owner_id);
CREATE INDEX idx_brands_slug ON brands(brand_slug);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_orders_buyer_email ON orders(buyer_email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_brand_id ON coupons(brand_id);
CREATE INDEX idx_coupon_redemptions_coupon_id ON coupon_redemptions(coupon_id);
CREATE INDEX idx_coupon_redemptions_status ON coupon_redemptions(status);
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_status ON product_reviews(status);
-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_auth_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- Profiles RLS
CREATE POLICY "Users can read their own profile" ON profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
-- Brands RLS
CREATE POLICY "Anyone can read active brands" ON brands FOR
SELECT USING (is_active = true);
CREATE POLICY "Sellers can read their own brand" ON brands FOR
SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Sellers can update their own brand" ON brands FOR
UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Sellers can create brands" ON brands FOR
INSERT WITH CHECK (auth.uid() = owner_id);
-- Products RLS
CREATE POLICY "Anyone can read active products" ON products FOR
SELECT USING (status = 'active');
CREATE POLICY "Sellers can see their own products" ON products FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM brands
      WHERE brands.id = products.brand_id
        AND brands.owner_id = auth.uid()
    )
  );
CREATE POLICY "Sellers can insert products" ON products FOR
INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM brands
      WHERE brands.id = products.brand_id
        AND brands.owner_id = auth.uid()
    )
  );
CREATE POLICY "Sellers can update their own products" ON products FOR
UPDATE USING (
    EXISTS (
      SELECT 1
      FROM brands
      WHERE brands.id = products.brand_id
        AND brands.owner_id = auth.uid()
    )
  );
-- Product images RLS
CREATE POLICY "Anyone can read product images of active products" ON product_images FOR
SELECT USING (
    EXISTS (
      SELECT 1
      FROM products
      WHERE products.id = product_images.product_id
        AND products.status = 'active'
    )
  );
-- Addresses RLS
CREATE POLICY "Users can read their own addresses" ON addresses FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own addresses" ON addresses FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses" ON addresses FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);
-- Orders RLS
CREATE POLICY "Users can read their own orders" ON orders FOR
SELECT USING (
    auth.uid() = user_id
    OR (auth.uid()::text = buyer_email)
    OR EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
        AND user_type = 'seller'
    )
  );
CREATE POLICY "Anyone can insert orders (guests allowed)" ON orders FOR
INSERT WITH CHECK (true);
-- Wishlist RLS
CREATE POLICY "Users can read their own wishlist" ON wishlist FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to their wishlist" ON wishlist FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from their wishlist" ON wishlist FOR DELETE USING (auth.uid() = user_id);
-- Blog posts RLS
CREATE POLICY "Anyone can read published blog posts" ON blog_posts FOR
SELECT USING (published_at IS NOT NULL);
-- Coupons RLS
CREATE POLICY "Anyone can read active coupons" ON coupons FOR
SELECT USING (
    is_active = true
    AND (
      expires_at IS NULL
      OR expires_at > NOW()
    )
  );
CREATE POLICY "Only service role can manage coupon redemptions" ON coupon_redemptions FOR
SELECT USING (false);
-- Product Reviews RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read approved reviews" ON product_reviews FOR
SELECT USING (status = 'approved');
CREATE POLICY "Users can read their own reviews" ON product_reviews FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reviews" ON product_reviews FOR
INSERT WITH CHECK (
    auth.uid() = user_id
    OR user_id IS NULL
  );
CREATE POLICY "Users can update their own reviews" ON product_reviews FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON product_reviews FOR DELETE USING (auth.uid() = user_id);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.profiles TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.profiles TO service_role;
GRANT SELECT ON public.seller_auth_credentials TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.seller_auth_credentials TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.seller_auth_credentials TO service_role;
GRANT SELECT ON public.seller_auth_sessions TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.seller_auth_sessions TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.seller_auth_sessions TO service_role;
GRANT SELECT ON public.brands TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.brands TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.brands TO service_role;
GRANT SELECT ON public.products TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.products TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.products TO service_role;
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.product_images TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.product_images TO service_role;
GRANT SELECT ON public.addresses TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.addresses TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.addresses TO service_role;
GRANT SELECT ON public.orders TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.orders TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.orders TO service_role;
GRANT SELECT ON public.order_items TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.order_items TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.order_items TO service_role;
GRANT SELECT ON public.coupons TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.coupons TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.coupons TO service_role;
GRANT SELECT ON public.coupon_redemptions TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.coupon_redemptions TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.coupon_redemptions TO service_role;
GRANT SELECT ON public.wishlist TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.wishlist TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.wishlist TO service_role;
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.blog_posts TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.blog_posts TO service_role;
GRANT SELECT ON public.product_reviews TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.product_reviews TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.product_reviews TO service_role;
CREATE TABLE IF NOT EXISTS public.skin_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT,
  skin_type TEXT CHECK (
    skin_type IN ('seca', 'grasa', 'mixta', 'normal', 'sensible')
  ),
  concerns TEXT [] NOT NULL DEFAULT '{}',
  goals TEXT [] NOT NULL DEFAULT '{}',
  notes TEXT,
  report_file_url TEXT,
  report_file_type TEXT CHECK (
    report_file_type IS NULL
    OR report_file_type IN ('image', 'pdf')
  ),
  report_file_public_id TEXT,
  source TEXT NOT NULL DEFAULT 'form' CHECK (
    source IN (
      'form',
      'professional_report',
      'ai_photo',
      'ai_text'
    )
  ),
  saved BOOLEAN NOT NULL DEFAULT false,
  ai_observations TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT skin_analyses_owner_check CHECK (
    user_id IS NOT NULL
    OR session_token IS NOT NULL
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_skin_analyses_session_token ON public.skin_analyses(session_token);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_user_id ON public.skin_analyses(user_id);
CREATE TABLE IF NOT EXISTS public.skin_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label_es TEXT NOT NULL,
  label_en TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('skin_type', 'concern', 'goal'))
);
CREATE TABLE IF NOT EXISTS public.product_skin_tags (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  skin_tag_id UUID NOT NULL REFERENCES public.skin_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, skin_tag_id)
);
CREATE INDEX IF NOT EXISTS idx_product_skin_tags_tag ON public.product_skin_tags(skin_tag_id);
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS skin_notes TEXT;
INSERT INTO public.skin_tags (slug, label_es, label_en, category)
VALUES (
    'piel_seca',
    'Piel seca',
    'Dry skin',
    'skin_type'
  ),
  (
    'piel_grasa',
    'Piel grasa',
    'Oily skin',
    'skin_type'
  ),
  (
    'piel_mixta',
    'Piel mixta',
    'Combination skin',
    'skin_type'
  ),
  (
    'piel_normal',
    'Piel normal',
    'Normal skin',
    'skin_type'
  ),
  (
    'piel_sensible',
    'Piel sensible',
    'Sensitive skin',
    'skin_type'
  ),
  ('rosacea', 'Rosacea', 'Rosacea', 'concern'),
  ('acne', 'Acne', 'Acne', 'concern'),
  (
    'manchas',
    'Manchas / hiperpigmentacion',
    'Dark spots',
    'concern'
  ),
  (
    'deshidratacion',
    'Deshidratacion',
    'Dehydration',
    'concern'
  ),
  (
    'poros_dilatados',
    'Poros dilatados',
    'Enlarged pores',
    'concern'
  ),
  ('hidratar', 'Hidratar', 'Hydrate', 'goal'),
  (
    'reducir_brillo',
    'Reducir brillo',
    'Reduce shine',
    'goal'
  ),
  ('antiedad', 'Antiedad', 'Anti-aging', 'goal'),
  (
    'calmar_rojeces',
    'Calmar rojeces',
    'Soothe redness',
    'goal'
  ) ON CONFLICT (slug) DO NOTHING;
ALTER TABLE public.skin_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skin_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_skin_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own skin analyses" ON public.skin_analyses FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own skin analyses" ON public.skin_analyses FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skin analyses" ON public.skin_analyses FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own skin analyses" ON public.skin_analyses FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read skin tags" ON public.skin_tags FOR
SELECT USING (true);
CREATE POLICY "Anyone can read product skin tags" ON public.product_skin_tags FOR
SELECT USING (true);
GRANT SELECT ON public.skin_analyses TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.skin_analyses TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.skin_analyses TO service_role;
GRANT SELECT ON public.skin_tags TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.skin_tags TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.skin_tags TO service_role;
GRANT SELECT ON public.product_skin_tags TO anon;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.product_skin_tags TO authenticated;
GRANT SELECT,
  INSERT,
  UPDATE,
  DELETE ON public.product_skin_tags TO service_role;