-- Agrega soporte para analisis de piel generado por IA (foto o texto).
-- No modifica ninguna fila existente.
ALTER TABLE skin_analyses DROP CONSTRAINT IF EXISTS skin_analyses_source_check;
ALTER TABLE skin_analyses
ADD CONSTRAINT skin_analyses_source_check CHECK (
    source IN (
      'form',
      'professional_report',
      'ai_photo',
      'ai_text'
    )
  );
ALTER TABLE skin_analyses
ADD COLUMN IF NOT EXISTS ai_observations TEXT;