import { supabaseServer } from '@/lib/supabase'

export type ProductReviewSchemaRecord = {
  authorName: string
  rating: number
  title?: string
  content: string
  datePublished: string
}

export async function getProductReviewsForSchema(
  productId: string,
  limit = 3
): Promise<ProductReviewSchemaRecord[]> {
  const { data, error } = await supabaseServer
    .from('reviews')
    .select('reviewer_name, rating, title, content, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []

  return (data ?? []).map((row) => ({
    authorName: row.reviewer_name,
    rating: Number(row.rating ?? 0),
    title: row.title ?? undefined,
    content: row.content,
    datePublished: row.created_at,
  }))
}
