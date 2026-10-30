-- Costo unitario del producto (CLP) para calcular margen y utilidad en el dashboard del vendedor.
-- Es opcional: si es NULL, el dashboard avisa que falta el costo y no lo cuenta como 0.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) CHECK (cost_price IS NULL OR cost_price >= 0);

COMMENT ON COLUMN products.cost_price IS 'Costo unitario del producto para el vendedor (privado, nunca se expone en la tienda pública).';
