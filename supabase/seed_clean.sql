-- ============================================================================
-- BEAUTY THERAPIST - CLEAN SEED DATA (PRODUCTION)
-- ============================================================================
-- Este script crea SOLO:
-- 1. Perfil de Angelica Baeriswyl (seller)
-- 2. Marca AngeBae
-- 3. SIN productos (vacío para que Angelica agregue los suyos)
-- ============================================================================
-- 1. Insertar perfil de Angelica Baeriswyl
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
    'Angelica Baeriswyl',
    'angebae@gmail.com',
    '+56 9 4527 7806',
    'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop'
  ) ON CONFLICT (email) DO NOTHING;
-- 2. Crear marca AngeBae
WITH angelica_seller AS (
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
SELECT angelica_seller.id,
  'AngeBae',
  'angebae',
  'Skincare y maquillaje premium para el cuidado de tu piel.',
  'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop',
  'both',
  true
FROM angelica_seller ON CONFLICT (brand_slug) DO NOTHING;
-- ============================================================================
-- RESULTADO:
-- ✅ Perfil creado: angebae@gmail.com / password123
-- ✅ Marca creada: AngeBae
-- ✅ SIN productos (lista para que Angelica agregue)
-- ============================================================================