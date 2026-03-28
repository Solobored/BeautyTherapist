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
}
