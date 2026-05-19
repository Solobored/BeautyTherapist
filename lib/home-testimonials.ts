import { supabaseServer } from '@/lib/supabase'
import { testimonials as fallbackTestimonials } from '@/lib/data'

export type HomeTestimonial = {
  id: string
  customerName: string
  customerImage: string
  rating: number
  text: string
  brandName?: string
}

export async function fetchHomeTestimonials(): Promise<HomeTestimonial[]> {
  try {
    const { data, error } = await supabaseServer
      .from('brands')
      .select('id, brand_name, logo_url, custom_reviews')
      .eq('is_active', true)

    if (error) {
      return fallbackTestimonials
    }

    const customReviews = (data ?? []).flatMap((brand) =>
      Array.isArray(brand.custom_reviews)
        ? brand.custom_reviews.map((review: any, index: number) => ({
            id: `${brand.id}-${review.id ?? index}`,
            customerName: String(review.customerName ?? 'Cliente'),
            customerImage: brand.logo_url || '/placeholder-user.jpg',
            rating: Number(review.rating ?? 5),
            text: String(review.text ?? ''),
            brandName: brand.brand_name ?? undefined,
          }))
        : []
    )

    return customReviews.length > 0 ? customReviews : fallbackTestimonials
  } catch {
    return fallbackTestimonials
  }
}
