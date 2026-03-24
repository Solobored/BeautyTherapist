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
-- Seller brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  brand_slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
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
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order DECIMAL(10, 2),
  max_uses INT,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
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
-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
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