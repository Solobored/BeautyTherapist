import { supabaseServer } from '@/lib/supabase'

export async function validateSkinTagIds(value: unknown): Promise<string[] | null> {
  if (!Array.isArray(value) || value.some((id) => typeof id !== 'string')) return null
  const ids = [...new Set(value)] as string[]
  if (ids.length === 0) return ids

  const { data, error } = await supabaseServer.from('skin_tags').select('id').in('id', ids)
  if (error) throw error
  return data?.length === ids.length ? ids : null
}

export async function replaceProductSkinTags(productId: string, skinTagIds: string[]) {
  const { error: deleteError } = await supabaseServer
    .from('product_skin_tags')
    .delete()
    .eq('product_id', productId)
  if (deleteError) throw deleteError
  if (skinTagIds.length === 0) return

  const { error: insertError } = await supabaseServer.from('product_skin_tags').insert(
    skinTagIds.map((skinTagId) => ({ product_id: productId, skin_tag_id: skinTagId })),
  )
  if (insertError) throw insertError
}