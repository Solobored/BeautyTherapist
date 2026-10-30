import { supabaseServer } from '@/lib/supabase'

export type HomeTestimonial = {
  id: string
  customerName: string
  rating: number
  text: string
  productId: string
  verifiedPurchase: boolean
}

export async function fetchHomeTestimonials(): Promise<HomeTestimonial[]> {
  try {
    const { data, error } = await supabaseServer
      .from('reviews')
      .select('id, reviewer_name, rating, content, product_id, verified_purchase')
      .not('product_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error loading home reviews:', error)
      return []
    }

    return (data ?? [])
      .filter((review) => review.product_id && review.content.trim())
      .map((review) => ({
        id: review.id,
        customerName: review.reviewer_name,
        rating: Number(review.rating),
        text: review.content,
        productId: review.product_id!,
        verifiedPurchase: Boolean(review.verified_purchase),
      }))
  } catch (error) {
    console.error('Error loading home reviews:', error)
    return []
  }
}
