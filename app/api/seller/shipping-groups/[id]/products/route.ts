import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const { id } = await context.params
    const body = (await request.json()) as { productIds?: string[] }
    const productIds = Array.from(new Set((body.productIds ?? []).filter(Boolean)))

    const { data: group, error: groupError } = await supabaseServer
      .from('shipping_groups')
      .select('id')
      .eq('id', id)
      .eq('seller_id', session.sellerId)
      .maybeSingle()

    if (groupError || !group?.id) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })
    }

    if (productIds.length > 0) {
      const { data: ownedProducts, error: ownedProductsError } = await supabaseServer
        .from('products')
        .select('id')
        .eq('brand_id', session.brandId)
        .in('id', productIds)

      if (ownedProductsError) {
        return NextResponse.json({ error: ownedProductsError.message }, { status: 500 })
      }

      if ((ownedProducts ?? []).length !== productIds.length) {
        return NextResponse.json({ error: 'Solo puedes asignar tus propios productos.' }, { status: 400 })
      }
    }

    await supabaseServer
      .from('product_shipping_groups')
      .delete()
      .in('product_id', productIds.length > 0 ? productIds : ['00000000-0000-0000-0000-000000000000'])

    await supabaseServer.from('product_shipping_groups').delete().eq('shipping_group_id', id)

    if (productIds.length > 0) {
      const { error: insertError } = await supabaseServer.from('product_shipping_groups').insert(
        productIds.map((productId) => ({
          product_id: productId,
          shipping_group_id: id,
        }))
      )

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      await supabaseServer
        .from('products')
        .update({
          shipping_mode: 'custom_group',
          updated_at: new Date().toISOString(),
        })
        .in('id', productIds)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('shipping-groups products PUT', error)
    return NextResponse.json({ error: 'Error al actualizar productos del grupo' }, { status: 500 })
  }
}
