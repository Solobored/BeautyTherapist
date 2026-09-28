export type SkinAnalysisSource =
  | 'form'
  | 'professional_report'
  | 'ai_photo'
  | 'ai_text'

export type SkinType = 'seca' | 'grasa' | 'mixta' | 'normal' | 'sensible'

export type SkinTagCategory = 'skin_type' | 'concern' | 'goal'

export interface SkinTag {
  id: string
  slug: string
  label_es: string
  label_en: string
  category: SkinTagCategory
}