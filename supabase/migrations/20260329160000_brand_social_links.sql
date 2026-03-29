-- Agrega campos de redes sociales y banner para marcas
ALTER TABLE brands ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
