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
  source TEXT NOT NULL DEFAULT 'form' CHECK (source IN ('form', 'professional_report')),
  saved BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT skin_analyses_owner_check CHECK (
    user_id IS NOT NULL
    OR session_token IS NOT NULL
  )
);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_user_id ON public.skin_analyses(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_skin_analyses_session_token ON public.skin_analyses(session_token);
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