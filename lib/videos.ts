import { supabaseServer } from '@/lib/supabase'
import type { VideoItem } from '@/lib/video-types'

export async function fetchPublicVideos(limit = 10): Promise<VideoItem[]> {
  const { data, error } = await supabaseServer
    .from('seller_videos')
    .select(
      `
      id,
      brand_id,
      title,
      description,
      cloudinary_url,
      thumbnail_url,
      featured_product_ids,
      views_count,
      likes_count,
      duration_seconds,
      brands (
        id,
        brand_name,
        logo_url
      )
    `
    )
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []

  const productIds = Array.from(new Set((data ?? []).flatMap((video) => video.featured_product_ids ?? [])))
  const { data: products } =
    productIds.length > 0
      ? await supabaseServer
          .from('products')
          .select('id, name_es, name_en, price, product_images (url, position)')
          .in('id', productIds)
      : { data: [] as any[] }

  const productMap = new Map(
    (products ?? []).map((product) => [
      product.id,
      {
        id: product.id,
        name: product.name_es || product.name_en,
        imageUrl:
          product.product_images
            ?.slice()
            .sort(
              (a: { position?: number | null }, b: { position?: number | null }) =>
                (a.position ?? 0) - (b.position ?? 0)
            )[0]?.url ??
          '/placeholder.svg',
        price: Number(product.price ?? 0),
        slug: product.id,
      },
    ])
  )

  return (data ?? []).map((video) => {
    const brand = Array.isArray(video.brands) ? video.brands[0] : video.brands
    return {
      id: video.id,
      title: video.title,
      description: video.description ?? undefined,
      cloudinaryUrl: video.cloudinary_url,
      thumbnailUrl: video.thumbnail_url ?? undefined,
      brandName: brand?.brand_name ?? 'BeautyTherapist',
      brandLogoUrl: brand?.logo_url ?? undefined,
      brandId: video.brand_id ?? brand?.id ?? '',
      featuredProducts: (video.featured_product_ids ?? [])
        .map((productId: string) => productMap.get(productId))
        .filter(Boolean),
      viewsCount: video.views_count,
      likesCount: video.likes_count,
      durationSeconds: video.duration_seconds ?? undefined,
    }
  })
}
