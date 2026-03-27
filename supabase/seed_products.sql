-- Insert AngeBae seller account in profiles
-- Note: Only insert if profile doesn't exist
INSERT INTO profiles (
    user_type,
    full_name,
    email,
    phone,
    avatar_url
  )
VALUES (
    'seller',
    'Angela Rodriguez',
    'angebae@gmail.com',
    '+1 555 123 4567',
    'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop'
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
  'Premium skincare and makeup crafted with love. Our products combine natural ingredients with innovative formulas to reveal your natural beauty.',
  'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop',
  'both',
  true
FROM angebae_seller ON CONFLICT (brand_slug) DO NOTHING;
-- Insert AngeBae products
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
VALUES (
    (
      SELECT id
      FROM angebae_brand
    ),
    'Sérum Resplandor Radiante',
    'Radiance Glow Serum',
    'Un lujoso sérum de vitamina C que ilumina y unifica el tono de la piel mientras proporciona una poderosa protección antioxidante. Formulado con 15% de vitamina C estabilizada y ácido hialurónico para una tez luminosa e hidratada.',
    'A luxurious vitamin C serum that brightens and evens skin tone while providing powerful antioxidant protection. Formulated with 15% stabilized vitamin C and hyaluronic acid for a luminous, hydrated complexion.',
    'Aqua, Ascorbic Acid, Sodium Hyaluronate, Ferulic Acid, Vitamin E, Aloe Vera Extract, Glycerin, Niacinamide',
    'Aplica 3-4 gotas sobre la piel limpia y seca por la mañana y por la noche. Continúa con hidratante y protector solar durante el día.',
    68.00,
    85.00,
    45,
    'skincare',
    'active'
  ),
  (
    (
      SELECT id
      FROM angebae_brand
    ),
    'Hidratante Rosa de Terciopelo',
    'Velvet Rose Moisturizer',
    'Una crema ultra-rica infusionada con aceite de rosa mosqueta y péptidos para una hidratación profunda y beneficios anti-edad. Perfecta para pieles secas y maduras.',
    'An ultra-rich moisturizer infused with rose hip oil and peptides for deep hydration and anti-aging benefits. Perfect for dry and mature skin types.',
    'Rosa Canina Fruit Oil, Peptide Complex, Shea Butter, Jojoba Oil, Ceramides, Vitamin E, Rose Water',
    'Masajea suavemente en el rostro y cuello después de la limpieza y el sérum. Usa por la mañana y por la noche.',
    54.00,
    75.00,
    32,
    'skincare',
    'active'
  ),
  (
    (
      SELECT id
      FROM angebae_brand
    ),
    'Base de Seda SPF 30',
    'Silk Foundation SPF 30',
    'Una base ligera y modulable con acabado natural y protección solar. Infusionada con ingredientes de skincare para nutrir mientras la usas.',
    'A weightless, buildable foundation with natural finish and sun protection. Infused with skincare ingredients to nourish while you wear.',
    'Zinc Oxide, Titanium Dioxide, Hyaluronic Acid, Vitamin E, Silica, Iron Oxides',
    'Aplica con brocha, esponja o las yemas de los dedos. Construye la cobertura según desees. Reaplica protector solar durante el día.',
    42.00,
    60.00,
    67,
    'makeup',
    'active'
  ),
  (
    (
      SELECT id
      FROM angebae_brand
    ),
    'Crema de Ojos Recuperación Nocturna',
    'Midnight Recovery Eye Cream',
    'Un tratamiento intensivo para ojos que trabaja durante la noche para reducir ojeras, hinchazón y líneas finas. Formulado con cafeína y retinol.',
    'An intensive eye treatment that works overnight to reduce dark circles, puffiness, and fine lines. Formulated with caffeine and retinol.',
    'Caffeine, Retinol, Peptides, Hyaluronic Acid, Cucumber Extract, Green Tea Extract, Vitamin K',
    'Da pequeños toques con una pequeña cantidad alrededor del área de los ojos antes de dormir. Evita el contacto directo con los ojos.',
    48.00,
    70.00,
    28,
    'skincare',
    'active'
  ),
  (
    (
      SELECT id
      FROM angebae_brand
    ),
    'Tinte de Labios Pétalo Suave',
    'Petal Soft Lip Tint',
    'Un tinte labial hidratante que proporciona un color de aspecto natural con acabado húmedo. Enriquecido con rosa mosqueta y vitamina E.',
    'A hydrating lip tint that delivers natural-looking color with a dewy finish. Enriched with rosehip and vitamin E.',
    'Castor Oil, Rosa Canina Oil, Vitamin E, Beeswax, Natural Pigments, Jojoba Oil',
    'Aplica directamente en los labios. Superpone para más intensidad o difumina con la yema del dedo para un toque sutil de color.',
    24.00,
    32.00,
    89,
    'makeup',
    'active'
  ),
  (
    (
      SELECT id
      FROM angebae_brand
    ),
    'Bruma Facial Hidra-Relleno',
    'Hydra-Plump Face Mist',
    'Una bruma facial refrescante que hidrata instantáneamente y revive la piel cansada. Perfecta para fijar el maquillaje o refrescar durante el día.',
    'A refreshing facial mist that instantly hydrates and revives tired skin. Perfect for setting makeup or midday refreshment.',
    'Rose Water, Aloe Vera, Glycerin, Hyaluronic Acid, Green Tea Extract, Chamomile',
    'Rocía sobre el rostro cuando la piel necesite un impulso. Usa antes o después del maquillaje.',
    28.00,
    40.00,
    3,
    'skincare',
    'active'
  ),
  (
    (
      SELECT id
      FROM angebae_brand
    ),
    'Máscara de Pestañas Lujosa',
    'Lash Luxe Mascara',
    'Una máscara de pestañas que alarga y da volumen con fórmula modulable. Crea pestañas dramáticas sin grumos ni descamación.',
    'A lengthening and volumizing mascara with a buildable formula. Creates dramatic lashes without clumping or flaking.',
    'Beeswax, Carnauba Wax, Iron Oxides, Vitamin E, Biotin, Castor Oil',
    'Mueve el aplicador desde la raíz hasta la punta. Construye capas para más volumen. Deja secar entre capas.',
    32.00,
    45.00,
    56,
    'makeup',
    'active'
  ),
  (
    (
      SELECT id
      FROM angebae_brand
    ),
    'Limpiador en Espuma Suave',
    'Gentle Foam Cleanser',
    'Un limpiador en espuma con pH equilibrado que elimina el maquillaje y las impurezas sin resecar la piel. Apto para todo tipo de pieles.',
    'A pH-balanced foam cleanser that removes makeup and impurities without stripping skin. Suitable for all skin types.',
    'Coconut-derived Surfactants, Aloe Vera, Chamomile Extract, Green Tea, Glycerin, Panthenol',
    'Bombea la espuma en las manos y masajea sobre la piel húmeda. Enjuaga completamente con agua.',
    34.00,
    50.00,
    41,
    'skincare',
    'active'
  );
-- Insert product images for each product
-- Images for product 1 (Radiance Glow Serum)
INSERT INTO product_images (product_id, url, position, is_primary)
SELECT id,
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop',
  1,
  true
FROM products
WHERE name_en = 'Radiance Glow Serum'
UNION ALL
SELECT id,
  'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=600&fit=crop',
  2,
  false
FROM products
WHERE name_en = 'Radiance Glow Serum';
-- Images for product 2 (Velvet Rose Moisturizer)
INSERT INTO product_images (product_id, url, position, is_primary)
SELECT id,
  'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop',
  1,
  true
FROM products
WHERE name_en = 'Velvet Rose Moisturizer'
UNION ALL
SELECT id,
  'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&h=600&fit=crop',
  2,
  false
FROM products
WHERE name_en = 'Velvet Rose Moisturizer';
-- Images for product 3 (Silk Foundation SPF 30)
INSERT INTO product_images (product_id, url, position, is_primary)
SELECT id,
  'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&h=600&fit=crop',
  1,
  true
FROM products
WHERE name_en = 'Silk Foundation SPF 30'
UNION ALL
SELECT id,
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop',
  2,
  false
FROM products
WHERE name_en = 'Silk Foundation SPF 30';
-- Images for product 4 (Midnight Recovery Eye Cream)
INSERT INTO product_images (product_id, url, position, is_primary)
SELECT id,
  'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=600&fit=crop',
  1,
  true
FROM products
WHERE name_en = 'Midnight Recovery Eye Cream'
UNION ALL
SELECT id,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop',
  2,
  false
FROM products
WHERE name_en = 'Midnight Recovery Eye Cream';
-- Images for product 5 (Petal Soft Lip Tint)
INSERT INTO product_images (product_id, url, position, is_primary)
SELECT id,
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop',
  1,
  true
FROM products
WHERE name_en = 'Petal Soft Lip Tint'
UNION ALL
SELECT id,
  'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600&h=600&fit=crop',
  2,
  false
FROM products
WHERE name_en = 'Petal Soft Lip Tint';
-- Images for product 6 (Hydra-Plump Face Mist)
INSERT INTO product_images (product_id, url, position, is_primary)
SELECT id,
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop',
  1,
  true
FROM products
WHERE name_en = 'Hydra-Plump Face Mist'
UNION ALL
SELECT id,
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop',
  2,
  false
FROM products
WHERE name_en = 'Hydra-Plump Face Mist';
-- Images for product 7 (Lash Luxe Mascara)
INSERT INTO product_images (product_id, url, position, is_primary)
SELECT id,
  'https://images.unsplash.com/photo-1631214540553-ff044a3ff1ea?w=600&h=600&fit=crop',
  1,
  true
FROM products
WHERE name_en = 'Lash Luxe Mascara'
UNION ALL
SELECT id,
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop',
  2,
  false
FROM products
WHERE name_en = 'Lash Luxe Mascara';
-- Images for product 8 (Gentle Foam Cleanser)
INSERT INTO product_images (product_id, url, position, is_primary)
SELECT id,
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop',
  1,
  true
FROM products
WHERE name_en = 'Gentle Foam Cleanser'
UNION ALL
SELECT id,
  'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=600&h=600&fit=crop',
  2,
  false
FROM products
WHERE name_en = 'Gentle Foam Cleanser';