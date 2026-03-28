-- Peso / contenido para cálculo de envío (cosmética: ml × g/ml ≈ gramos)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS net_content_ml NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS grams_per_ml NUMERIC(10, 4) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS weight_override_g NUMERIC(10, 2);

COMMENT ON COLUMN products.net_content_ml IS 'Contenido neto en ml (envase), p. ej. 30, 50';
COMMENT ON COLUMN products.grams_per_ml IS 'Conversión a gramos para envío (líquidos ~1; cremas ~0.9–1.1 según fórmula)';
COMMENT ON COLUMN products.weight_override_g IS 'Opcional: peso real de la unidad en g; si no null, reemplaza ml×grams_per_ml';
