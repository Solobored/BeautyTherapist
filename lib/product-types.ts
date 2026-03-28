/** Storefront product shape (Supabase-backed). */
export interface StoreProduct {
  id: string
  name: string
  nameEs: string
  brand: string
  brandSlug: string
  category: 'skincare' | 'makeup'
  price: number
  comparePrice?: number
  description: string
  descriptionEs: string
  ingredients: string
  howToUse: string
  howToUseEs: string
  images: string[]
  rating: number
  reviewCount: number
  stock: number
  status: 'active' | 'draft' | 'inactive'
  /** Contenido neto (ml) para calcular peso de envío en Chile. */
  netContentMl?: number | null
  /** Gramos por ml (ej. ~1 para acuosos; aceites ~0,92). */
  gramsPerMl?: number
  /** Si está definido, peso por unidad en gramos (anula ml × g/ml). */
  weightOverrideG?: number | null
}
