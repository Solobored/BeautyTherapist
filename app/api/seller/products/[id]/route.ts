import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { resolveBrandIdForSeller } from '@/lib/seller-server'
import { mapDbProductToProduct } from '@/lib/seller-product-map'

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
    const { id } = await context.params
    const email = request.headers.get('x-seller-email')?.trim() ?? ''
    const slug = request.headers.get('x-brand-slug')?.trim() ?? ''
    if (!email) {
      return NextResponse.json({ error: 'Missing x-seller-email header' }, { status: 400 })
    }

    const brandId = await resolveBrandIdForSeller(
      supabaseServer,
      email,
      slug || email.split('@')[0]?.toLowerCase() || undefined
    )
    if (!brandId) {
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
    }

    const ok = await assertProductOwned(brandId, id)
    if (!ok) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const { data, error } = await supabaseServer
      .from('products')
      .select(
        `
        id,
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
      )
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ product: mapDbProductToProduct(data as Parameters<typeof mapDbProductToProduct>[0]) })
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
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const email = request.headers.get('x-seller-email')?.trim() ?? ''
    const slug = request.headers.get('x-brand-slug')?.trim() ?? ''
    if (!email) {
      return NextResponse.json({ error: 'Missing x-seller-email header' }, { status: 400 })
    }

    const brandId = await resolveBrandIdForSeller(
      supabaseServer,
      email,
      slug || email.split('@')[0]?.toLowerCase() || undefined
    )
    if (!brandId) {
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
    }

    const ok = await assertProductOwned(brandId, id)
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

    if (Object.keys(patch).length > 0) {
      patch.updated_at = new Date().toISOString()
      const { error: upErr } = await supabaseServer.from('products').update(patch).eq('id', id)
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
    const { id } = await context.params
    const email = request.headers.get('x-seller-email')?.trim() ?? ''
    const slug = request.headers.get('x-brand-slug')?.trim() ?? ''
    if (!email) {
      return NextResponse.json({ error: 'Missing x-seller-email header' }, { status: 400 })
    }

    const brandId = await resolveBrandIdForSeller(
      supabaseServer,
      email,
      slug || email.split('@')[0]?.toLowerCase() || undefined
    )
    if (!brandId) {
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
    }

    const ok = await assertProductOwned(brandId, id)
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
