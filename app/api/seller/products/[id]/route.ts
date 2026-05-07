import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { mapDbProductToProduct } from '@/lib/seller-product-map'
import { isMissingShippingSchemaError } from '@/lib/products-compat'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function assertProductOwned(brandId: string, productId: string) {
  const { data, error } = await supabaseServer
    .from('products')
    .select('id')
    .eq('id', productId)
    .eq('brand_id', brandId)
    .maybeSingle()

  if (error || !data) return false
  return true
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
    }

    const { id } = await context.params
    const ok = await assertProductOwned(session.brandId, id)
    if (!ok) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const nextSelect = `
        id,
        brand_id,
        name_en,
        name_es,
        description_en,
        description_es,
        ingredients,
        how_to_use,
        price,
        compare_at_price,
        stock,
        category,
        status,
        net_content_ml,
        grams_per_ml,
        weight_override_g,
        shipping_mode,
        product_shipping_groups (shipping_group_id),
        brands (brand_name, brand_slug),
        product_images (url, position, is_primary)
      `

    const legacySelect = `
        id,
        brand_id,
        name_en,
        name_es,
        description_en,
        description_es,
        ingredients,
        how_to_use,
        price,
        compare_at_price,
        stock,
        category,
        status,
        net_content_ml,
        grams_per_ml,
        weight_override_g,
        brands (brand_name, brand_slug),
        product_images (url, position, is_primary)
      `

    let { data, error }: { data: any | null; error: any } = await supabaseServer
      .from('products')
      .select(nextSelect)
      .eq('id', id)
      .single()

    if (error && isMissingShippingSchemaError(error)) {
      const legacyResult: { data: any | null; error: any } = await supabaseServer
        .from('products')
        .select(legacySelect)
        .eq('id', id)
        .single()
      data = legacyResult.data
      error = legacyResult.error
    }

    if (error || !data) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      product: mapDbProductToProduct(data as Parameters<typeof mapDbProductToProduct>[0]),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

type PatchBody = {
  name?: string
  description?: string
  ingredients?: string
  howToUse?: string
  category?: 'skincare' | 'makeup'
  price?: number
  comparePrice?: number | null
  stock?: number
  status?: 'active' | 'draft' | 'inactive'
  images?: { url: string; position: number }[]
  netContentMl?: number | null
  gramsPerMl?: number | null
  weightOverrideG?: number | null
  shippingMode?: 'blue_express' | 'chile_express' | 'custom_group'
  shippingGroupId?: string | null
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
    }

    const { id } = await context.params
    const ok = await assertProductOwned(session.brandId, id)
    if (!ok) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const body = (await request.json()) as PatchBody
    const patch: Record<string, unknown> = {}

    if (body.name !== undefined) {
      const n = body.name.trim()
      patch.name_es = n
      patch.name_en = n
    }
    if (body.description !== undefined) {
      const d = body.description.trim()
      patch.description_es = d
      patch.description_en = d
    }
    if (body.ingredients !== undefined) patch.ingredients = body.ingredients.trim()
    if (body.howToUse !== undefined) patch.how_to_use = body.howToUse.trim()
    if (body.category !== undefined) patch.category = body.category
    if (body.price !== undefined) patch.price = body.price
    if (body.comparePrice !== undefined) patch.compare_at_price = body.comparePrice
    if (body.stock !== undefined) patch.stock = Math.max(0, Math.floor(body.stock))
    if (body.status !== undefined) patch.status = body.status
    if (body.netContentMl !== undefined) {
      patch.net_content_ml =
        body.netContentMl != null && Number.isFinite(body.netContentMl) && body.netContentMl >= 0
          ? body.netContentMl
          : null
    }
    if (body.gramsPerMl !== undefined) {
      patch.grams_per_ml =
        body.gramsPerMl != null && Number.isFinite(body.gramsPerMl) && body.gramsPerMl > 0
          ? body.gramsPerMl
          : 1
    }
    if (body.weightOverrideG !== undefined) {
      patch.weight_override_g =
        body.weightOverrideG != null &&
        Number.isFinite(body.weightOverrideG) &&
        body.weightOverrideG > 0
          ? body.weightOverrideG
          : null
    }
    if (body.shippingMode !== undefined) {
      patch.shipping_mode =
        body.shippingMode === 'chile_express' || body.shippingMode === 'custom_group'
          ? body.shippingMode
          : 'blue_express'
    }

    if (Object.keys(patch).length > 0) {
      patch.updated_at = new Date().toISOString()
      let { error: upErr } = await supabaseServer.from('products').update(patch).eq('id', id)
      if (upErr && isMissingShippingSchemaError(upErr)) {
        const { shipping_mode: _shippingMode, ...legacyPatch } = patch
        const legacyResult = await supabaseServer.from('products').update(legacyPatch).eq('id', id)
        upErr = legacyResult.error
      }
      if (upErr) {
        console.error(upErr)
        return NextResponse.json({ error: upErr.message }, { status: 500 })
      }
    }

    if (body.images && body.images.length > 0) {
      await supabaseServer.from('product_images').delete().eq('product_id', id)
      const rows = body.images.map((img, i) => ({
        product_id: id,
        url: img.url,
        position: img.position ?? i,
        is_primary: i === 0,
      }))
      const { error: imgErr } = await supabaseServer.from('product_images').insert(rows)
      if (imgErr) {
        console.error(imgErr)
        return NextResponse.json({ error: imgErr.message }, { status: 500 })
      }
    }

    if (body.shippingGroupId !== undefined) {
      const { error: deleteGroupError } = await supabaseServer
        .from('product_shipping_groups')
        .delete()
        .eq('product_id', id)
      if (deleteGroupError && !isMissingShippingSchemaError(deleteGroupError)) {
        console.error(deleteGroupError)
        return NextResponse.json({ error: deleteGroupError.message }, { status: 500 })
      }
      if (body.shippingGroupId?.trim()) {
        const { error: groupErr } = await supabaseServer.from('product_shipping_groups').insert({
          product_id: id,
          shipping_group_id: body.shippingGroupId.trim(),
        })
        if (groupErr) {
          if (!isMissingShippingSchemaError(groupErr)) {
            console.error(groupErr)
            return NextResponse.json({ error: groupErr.message }, { status: 500 })
          }
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
    }

    const { id } = await context.params
    const ok = await assertProductOwned(session.brandId, id)
    if (!ok) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const { error } = await supabaseServer.from('products').delete().eq('id', id)
    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
