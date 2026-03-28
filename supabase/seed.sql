-- Insert AngeBae seller account
-- Note: In production, use Supabase Auth API to create user with password
INSERT INTO profiles (
    id,
    user_type,
    full_name,
    email,
    phone,
    avatar_url
  )
VALUES (
    'f486c511-c72d-4c32-a562-af8606a448df',
    'seller',
    'AngeBae Beauty',
    'angebae@gmail.com',
    '+1-555-0123',
    'https://res.cloudinary.com/demo/image/fetch/https://placehold.co/200x200?text=AngeBae'
  ) ON CONFLICT (email) DO NOTHING;
-- Get AngeBae seller ID for inserting brand
WITH angebae_seller AS (
  SELECT id
  FROM profiles
  WHERE email = 'angebae@gmail.com'
)
INSERT INTO brands (
    owner_id,
    brand_name,
    brand_slug,
    description,
    logo_url,
    category,
    is_active
  )
SELECT angebae_seller.id,
  'AngeBae',
  'angebae',
  'Clean beauty for every skin type. Skincare rituals and makeup crafted with care.',
  'https://res.cloudinary.com/demo/image/fetch/https://placehold.co/300x300?text=AngeBae+Logo',
  'both',
  true
FROM angebae_seller ON CONFLICT (brand_slug) DO NOTHING;
-- Insert 10 AngeBae products (skincare & makeup)
WITH angebae_brand AS (
  SELECT id
  FROM brands
  WHERE brand_slug = 'angebae'
)
INSERT INTO products (
    brand_id,
    name_es,
    name_en,
    description_es,
    description_en,
    ingredients,
    how_to_use,
    price,
    compare_at_price,
    stock,
    category,
    status
  )
SELECT angebae_brand.id,
  'Sérum Vitamina C',
  'Vitamin C Serum',
  'Sérum revitalizante con vitamina C estabilizada, ácido hialurónico y niacinamida. Ilumina y unifica el tono de la piel.',
  'Revitalizing serum with stabilized vitamin C, hyaluronic acid and niacinamide. Illuminates and evens skin tone.',
  'Vitamin C (L-Ascorbic Acid), Hyaluronic Acid, Niacinamide, Ferulic Acid, Vitamin E, Glycerin',
  'Aplicar 2-3 gotas en rostro limpio, mañana y noche. Esperar 1 minuto antes de aplicar hidratante.',
  45.00,
  65.00,
  25,
  'skincare',
  'active'
FROM angebae_brand
UNION ALL
SELECT angebae_brand.id,
  'Crema Retinol Nocturna',
  'Night Retinol Cream',
  'Crema intensiva con retinol puro 0.5%, ácido láctico y péptidos. Regenera y suaviza líneas de expresión mientras duermes.',
  'Intensive cream with pure 0.5% retinol, lactic acid and peptides. Regenerates and softens expression lines overnight.',
  'Retinol, Retinyl Palmitate, Lactic Acid, Peptide Complex, Squalane',
  'Aplicar cantidad de arveja por la noche en piel limpia y seca. Comenzar 2-3 veces por semana.',
  52.00,
  75.00,
  18,
  'skincare',
  'active'
FROM angebae_brand
UNION ALL
SELECT angebae_brand.id,
  'Hidratante Ligero Ácido Hialurónico',
  'Lightweight Hyaluronic Hydrator',
  'Gel hidratante ligero con 5 tipos de ácido hialurónico. Hidratación profunda sin grasa.',
  'Lightweight hydrating gel with 5 types of hyaluronic acid. Deep hydration without grease.',
  'Hyaluronic Acid (5 molecular weights), Glycerin, Vegetable Glycerin, Sodium PCA, Green Tea Extract',
  'Aplicar en rostro y cuello húmedos. Usar día y noche. Inhabilidad perfecta para pieles grasas.',
  38.00,
  55.00,
  35,
  'skincare',
  'active'
FROM angebae_brand
UNION ALL
SELECT angebae_brand.id,
  'Mascarilla Desintoxicante Carbón',
  'Charcoal Detox Mask',
  'Mascarilla revitalizante con carbón activado y arcilla kaolín. Limpia poros profundamente.',
  'Revitalizing mask with activated charcoal and kaolin clay. Deeply cleansing pores.',
  'Activated Charcoal, Kaolin Clay, Tea Tree Oil, Salicylic Acid, Aloe Vera',
  'Aplicar capa uniforme, dejar 10-15 minutos, enjuagar con agua tibia. Usar 1-2 veces por semana.',
  28.00,
  42.00,
  40,
  'skincare',
  'active'
FROM angebae_brand
UNION ALL
SELECT angebae_brand.id,
  'Base de Maquillaje Mate Larga Duración',
  'Long-Wear Matte Foundation',
  'Base de larga duración con cobertura media a alta. Acabado mate natural sin brillos.',
  'Long-lasting foundation with medium to high coverage. Natural matte finish without shine.',
  'Cyclopentasiloxane, Titanium Dioxide, Iron Oxides, Dimethicone, Kaolin',
  'Aplicar con brocha o esponja húmeda. Una pizca es suficiente. Adapta a todos los tonos de piel.',
  35.00,
  50.00,
  30,
  'makeup',
  'active'
FROM angebae_brand
UNION ALL
SELECT angebae_brand.id,
  'Paleta Sombras 12 Colores Neutral',
  '12 Color Neutral Eyeshadow Palette',
  'Paleta con 12 sombras en tonos neutral, mate y brillante. Pigmentación intensa y larga duración.',
  'Palette with 12 eyeshadows in neutral tones, matte and shimmer. Intense pigmentation and long-wearing.',
  'Talc, Mica, Magnesium Carbonate, Titanium Dioxide, Iron Oxides, Carmine',
  'Aplicar con brocha seca para acabado mate. Con brocha húmeda para mayor intensidad. Excelente para viajes.',
  42.00,
  65.00,
  22,
  'makeup',
  'active'
FROM angebae_brand
UNION ALL
SELECT angebae_brand.id,
  'Lápiz Labial Tinte Largo Duración',
  'Long-Wear Lip Tint',
  'Tinte labial líquido con larga duración (12h). Acabado mate satinado y cómodo.',
  'Liquid lip tint with long-wearing formula (12h). Comfortable matte satin finish.',
  'Acrylates, Isododecane, Silica, Mica, Magnesium Stearate, Red Iron Oxides',
  'Aplicar directamente desde el aplicador. Dejar secar 30 segundos. Resistente al agua y comida.',
  22.00,
  32.00,
  50,
  'makeup',
  'active'
FROM angebae_brand
UNION ALL
SELECT angebae_brand.id,
  'Sérum Niacinamida 10%',
  'Niacinamide 10% Serum',
  'Sérum concentrado con niacinamida 10% y zinc. Controla sebo y cierra poros.',
  'Concentrated serum with 10% niacinamide and zinc. Controls oil and minimizes pores.',
  'Niacinamide (10%), Zinc PCA, Panthenol, Glycerin, Xanthan Gum',
  'Aplicar 1-2 gotas mañana y noche en rostro limpio. Dejar secar antes de hidratar.',
  35.00,
  50.00,
  28,
  'skincare',
  'active'
FROM angebae_brand
UNION ALL
SELECT angebae_brand.id,
  'Crema SPF 50+ Protector Solar',
  'SPF 50+ Sunscreen Cream',
  'Protector solar ligero de amplio espectro. Protege de rayos UVA/UVB. No deja blanco.',
  'Lightweight broad-spectrum sunscreen. Protects from UVA/UVB rays. No white cast.',
  'Zinc Oxide, Titanium Dioxide, Octinoxate, Avobenzone, Glycerin, Aloe Vera',
  'Aplicar generosamente en rostro y cuello 15 minutos antes de sol. Reaplicar cada 2 horas.',
  40.00,
  58.00,
  32,
  'skincare',
  'active'
FROM angebae_brand
UNION ALL
SELECT angebae_brand.id,
  'Desmaquillante Suave Agua Micelar',
  'Gentle Micellar Water Cleanser',
  'Agua micelar suave que elimina maquillaje, protector solar e impurezas. Hidrata mientras limpia.',
  'Gentle micellar water removes makeup, sunscreen and impurities. Hydrates while cleansing.',
  'Purified Water, Polysorbate 20, Sodium Chloride, Disodium EDTA, Panthenol, Rose Water',
  'Aplicar con algodón y pasar suavemente por rostro. No requiere enjuaguar.',
  18.00,
  28.00,
  45,
  'skincare',
  'active'
FROM angebae_brand;
-- Insert test buyer account
INSERT INTO profiles (
    id,
    user_type,
    full_name,
    email,
    phone,
    avatar_url
  )
VALUES (
    uuid_generate_v4(),
    'buyer',
    'Test Buyer',
    'testbuyer@gmail.com',
    '+1-555-9999',
    'https://res.cloudinary.com/demo/image/fetch/https://placehold.co/200x200?text=Buyer'
  ) ON CONFLICT (email) DO NOTHING;
-- Insert buyer addresses
WITH buyer_profile AS (
  SELECT id
  FROM profiles
  WHERE email = 'testbuyer@gmail.com'
)
INSERT INTO addresses (
    user_id,
    full_name,
    street,
    city,
    state,
    zip,
    country,
    is_default
  )
SELECT buyer_profile.id,
  'John Doe',
  '123 Main Street, Apt 4B',
  'New York',
  'NY',
  '10001',
  'United States',
  true
FROM buyer_profile
UNION ALL
SELECT buyer_profile.id,
  'John Doe',
  '456 Park Avenue',
  'Los Angeles',
  'CA',
  '90001',
  'United States',
  false
FROM buyer_profile;
-- Insert coupons
INSERT INTO coupons (
    code,
    discount_type,
    discount_value,
    min_order,
    max_uses,
    expires_at,
    is_active
  )
VALUES (
    'WELCOME10',
    'percentage',
    10.00,
    25.00,
    1000,
    NULL,
    true
  ),
  (
    'SKIN20',
    'percentage',
    20.00,
    40.00,
    500,
    NULL,
    true
  );
-- Insert past order for buyer
WITH buyer_profile AS (
  SELECT id
  FROM profiles
  WHERE email = 'testbuyer@gmail.com'
),
products_list AS (
  SELECT id,
    name_en,
    price
  FROM products
  WHERE category = 'skincare'
  LIMIT 2
), first_product AS (
  SELECT id,
    name_en,
    price
  FROM products
  WHERE category = 'skincare'
  ORDER BY created_at ASC
  LIMIT 1
), second_product AS (
  SELECT id,
    name_en,
    price
  FROM products
  WHERE category = 'makeup'
  ORDER BY created_at ASC
  LIMIT 1
)
INSERT INTO orders (
    buyer_email,
    buyer_name,
    buyer_phone,
    user_id,
    shipping_address,
    items,
    subtotal,
    shipping_cost,
    discount,
    total,
    payment_method,
    payment_status,
    order_status,
    coupon_code
  )
SELECT 'testbuyer@gmail.com',
  'John Doe',
  '+1-555-9999',
  buyer_profile.id,
  jsonb_build_object(
    'full_name',
    'John Doe',
    'street',
    '123 Main Street, Apt 4B',
    'city',
    'New York',
    'state',
    'NY',
    'zip',
    '10001',
    'country',
    'United States'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'product_id',
      fp.id,
      'name',
      fp.name_en,
      'quantity',
      1,
      'price',
      fp.price
    ),
    jsonb_build_object(
      'product_id',
      sp.id,
      'name',
      sp.name_en,
      'quantity',
      2,
      'price',
      sp.price
    )
  ),
  (fp.price + (sp.price * 2))::decimal,
  10.00,
  ((fp.price + (sp.price * 2)) * 0.1)::decimal,
  (
    (fp.price + (sp.price * 2)) + 10.00 - ((fp.price + (sp.price * 2)) * 0.1)
  )::decimal,
  'stripe',
  'completed',
  'delivered',
  'WELCOME10'
FROM buyer_profile,
  first_product fp,
  second_product sp;
-- Insert 3 blog posts
INSERT INTO blog_posts (
    title_es,
    title_en,
    slug,
    content_es,
    content_en,
    cover_image,
    category,
    author,
    published_at
  )
VALUES (
    'Rutina Skincare Perfecta para Pieles Grasas',
    'Perfect Skincare Routine for Oily Skin',
    'skincare-routine-oily-skin',
    'Las pieles grasas requieren una rutina especial. Comienza con un limpiador suave que no reseca. Aplicar un tónico equilibrador después de limpiar. Usa nuestro sérum de niacinamida para controlar el sebo. Finaliza con una crema ligera no comedogénica. Aplica protector solar diariamente sin falta. Los activos clave son niacinamida, ácido salicílico y zinc. Evita productos muy oclusivos. Hidratar incluso pieles grasas es esencial.',
    'Oily skin requires a special routine. Start with a gentle cleanser that doesn\'t dry out. Apply a balancing toner after cleansing. Use our niacinamide serum to control sebum. Finish with a lightweight non-comedogenic cream. Apply sunscreen daily without fail. Key actives are niacinamide, salicylic acid and zinc. Avoid overly occlusive products. Even oily skin needs hydration.',
    'https://res.cloudinary.com/demo/image/fetch/https://placehold.co/1200x600?text=Oily+Skin+Routine',
    'skincare',
    'AngeBae Team',
    NOW()
  ),
  (
    'Maquillaje Natural que Dura Todo el Día',
    'Natural Makeup That Lasts All Day',
    'natural-makeup-all-day',
    'El secreto de un maquillaje natural es la base perfecta. Prepara la piel con un primer ligero. Aplica nuestra base de larga duración en capas finas. Usa nuestras sombras neutras para un efecto ahumado suave. El tinte labial de larga duración es perfecto para un acabado natural. Fija todo con un spray transparente. Este look es perfecto para oficina o eventos casuales. La clave es la moderación en cantidad de producto.',
    'The secret to natural makeup is the perfect base. Prep skin with a lightweight primer. Apply our long-wearing foundation in thin layers. Use our neutral eyeshadows for a soft smokey effect. The long-wear lip tint is perfect for a natural finish. Set everything with a clear spray. This look is perfect for the office or casual events. The key is using minimal product quantities.',
    'https://res.cloudinary.com/demo/image/fetch/https://placehold.co/1200x600?text=Natural+Makeup',
    'makeup',
    'AngeBae Team',
    NOW()
  ),
  (
    'Protección Solar: No es Opcional',
    'Sunscreen: It\'s Not Optional',
    'importance-of-sunscreen',
    'El protector solar es el producto más importante en cualquier rutina skincare. Protege contra envejecimiento prematuro, manchas y cáncer de piel. Debería aplicarse diariamente, incluso en días nublados. Usar al menos SPF 30, idealmente SPF 50+. Nuestro protector solar SPF 50+ no deja blanco y es perfectamente hidratante. Reaplicar cada 2 horas si estás en el exterior. No esperes el verano para empezar. Comenzar una rutina diaria de protección solar ahora.",
  ' Sunscreen is the most important product in any skincare routine.It protects against premature aging,
    dark spots
    and skin cancer.It should be applied daily,
    even on cloudy days.Use at least SPF 30,
    ideally SPF 50 +.Our SPF 50 + sunscreen doesn \ 't leave white cast and is perfectly hydrating. Reapply every 2 hours if you\'re outdoors. Don\'t wait for summer to start. Begin a daily sunscreen routine now.',
    'https://res.cloudinary.com/demo/image/fetch/https://placehold.co/1200x600?text=Sunscreen',
    'skincare',
    'AngeBae Team',
    NOW()
  );