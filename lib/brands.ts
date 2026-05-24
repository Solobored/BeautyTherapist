import { supabaseServer } from '@/lib/supabase'
import { brands as fallbackBrands, type Brand } from '@/lib/data'

function mapBrand(row: {
  id: string
  brand_name: string
  brand_slug: string
  description?: string | null
  logo_url?: string | null
  banner_url?: string | null
  facebook_url?: string | null
  instagram_url?: string | null
  tiktok_url?: string | null
  custom_reviews?: Brand['customReviews']
  featured_product_ids?: string[] | null
}): Brand {
  return {
    id: row.id,
    name: row.brand_name,
    slug: row.brand_slug,
    description: row.description ?? '',
    logo: row.logo_url ?? '/placeholder.svg',
    banner: row.banner_url ?? '/placeholder.svg',
    facebook: row.facebook_url ?? undefined,
    instagram: row.instagram_url ?? undefined,
    tiktok: row.tiktok_url ?? undefined,
    customReviews: row.custom_reviews ?? undefined,
    featuredProductIds: row.featured_product_ids ?? undefined,
  }
}

const brandSelect =
  'id, brand_name, brand_slug, description, logo_url, banner_url, facebook_url, instagram_url, tiktok_url, custom_reviews, featured_product_ids'

export async function fetchPublicBrands(): Promise<Brand[]> {
  const { data, error } = await supabaseServer.from('brands').select(brandSelect).order('brand_name')

  if (error) return fallbackBrands

  const mapped = (data ?? []).map((row) =>
    mapBrand(row as Parameters<typeof mapBrand>[0])
  )

  return mapped.length > 0 ? mapped : fallbackBrands
}

export async function fetchPublicBrandBySlug(slug: string): Promise<Brand | null> {
  const { data, error } = await supabaseServer
    .from('brands')
    .select(brandSelect)
    .eq('brand_slug', slug)
    .maybeSingle()

  if (error || !data) {
    return fallbackBrands.find((brand) => brand.slug === slug) ?? null
  }

  return mapBrand(data as Parameters<typeof mapBrand>[0])
}
