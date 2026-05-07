export interface VideoProduct {
  id: string
  name: string
  imageUrl: string
  price: number
  slug: string
}

export interface VideoItem {
  id: string
  title: string
  description?: string
  cloudinaryUrl: string
  thumbnailUrl?: string
  brandName: string
  brandLogoUrl?: string
  brandId: string
  featuredProducts: VideoProduct[]
  viewsCount: number
  likesCount: number
  durationSeconds?: number
}
