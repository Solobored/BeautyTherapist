import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Resuelve la marca por email + slug. Las rutas /api/seller/* confían en los headers
 * enviados por el cliente; en producción conviene validar sesión (p. ej. JWT Supabase)
 * y comprobar que el email coincide con el usuario autenticado.
 */
export async function resolveBrandIdForSeller(
  supabase: SupabaseClient,
  sellerEmail: string,
  brandSlugFallback?: string
): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', sellerEmail.trim())
    .eq('user_type', 'seller')
    .maybeSingle()

  if (profile?.id) {
    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('owner_id', profile.id)
      .maybeSingle()
    if (brand?.id) return brand.id
  }

  if (brandSlugFallback) {
    const { data: bySlug } = await supabase
      .from('brands')
      .select('id')
      .eq('brand_slug', brandSlugFallback)
      .maybeSingle()
    return bySlug?.id ?? null
  }

  return null
}
