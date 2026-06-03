import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'
import { mapDbProductToProduct } from '@/lib/seller-product-map'
import { isMissingShippingSchemaError } from '@/lib/products-compat'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
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

    let { data, error }: { data: any[] | null; error: any } = await supabaseServer
      .from('products')
      .select(nextSelect)
      .eq('brand_id', session.brandId)
      .order('created_at', { ascending: false })

    if (error && isMissingShippingSchemaError(error)) {
      const legacyResult: { data: any[] | null; error: any } = await supabaseServer
        .from('products')
        .select(legacySelect)
        .eq('brand_id', session.brandId)
        .order('created_at', { ascending: false })
      data = legacyResult.data
      error = legacyResult.error
    }

    if (error) {
      console.error('seller products GET:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const products = (data ?? []).map((row) =>
      mapDbProductToProduct(row as Parameters<typeof mapDbProductToProduct>[0])
    )
    return NextResponse.json({ products })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

type CreateBody = {
  name: string
  description: string
  ingredients: string
  howToUse: string
  category: string
  price: number
  comparePrice?: number | null
  stock: number
  status: 'active' | 'draft' | 'inactive'
  images: { url: string; position: number }[]
  netContentMl?: number | null
  gramsPerMl?: number | null
  weightOverrideG?: number | null
  shippingMode?: 'blue_express' | 'chile_express' | 'custom_group'
  shippingGroupId?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
    }

    const body = (await request.json()) as CreateBody
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }
    if (!body.images || body.images.length < 1) {
      return NextResponse.json({ error: 'Al menos una imagen (WebP) es requerida' }, { status: 400 })
    }
    if (!body.category?.trim() || body.category.length > 80) {
      return NextResponse.json({ error: 'Categoría inválida' }, { status: 400 })
    }

    const name = body.name.trim()
    const desc = body.description?.trim() ?? ''
    const ing = body.ingredients?.trim() ?? ''
    const how = body.howToUse?.trim() ?? ''

    const gramsPerMl =
      body.gramsPerMl != null && Number.isFinite(body.gramsPerMl) && body.gramsPerMl > 0
        ? body.gramsPerMl
        : 1
    const netContentMl =
      body.netContentMl != null && Number.isFinite(body.netContentMl) && body.netContentMl >= 0
        ? body.netContentMl
        : null
    const weightOverrideG =
      body.weightOverrideG != null &&
      Number.isFinite(body.weightOverrideG) &&
      body.weightOverrideG > 0
        ? body.weightOverrideG
        : null

    const status =
      body.status === 'draft' || body.status === 'inactive' || body.status === 'active'
        ? body.status
        : 'draft'

    let { data: product, error: insertErr }: { data: { id: string } | null; error: any } = await supabaseServer
      .from('products')
      .insert({
        brand_id: session.brandId,
        name_es: name,
        name_en: name,
        description_es: desc,
        description_en: desc,
        ingredients: ing,
        how_to_use: how,
        price: body.price,
        compare_at_price: body.comparePrice ?? null,
        stock: Math.max(0, Math.floor(body.stock)),
        category: body.category.trim(),
        status,
        net_content_ml: netContentMl,
        grams_per_ml: gramsPerMl,
        weight_override_g: weightOverrideG,
        shipping_mode:
          body.shippingMode === 'chile_express' || body.shippingMode === 'custom_group'
            ? body.shippingMode
            : 'blue_express',
      })
      .select('id')
      .single()

    if (insertErr && isMissingShippingSchemaError(insertErr)) {
      const legacyInsert: { data: { id: string } | null; error: any } = await supabaseServer
        .from('products')
        .insert({
          brand_id: session.brandId,
          name_es: name,
          name_en: name,
          description_es: desc,
          description_en: desc,
          ingredients: ing,
          how_to_use: how,
          price: body.price,
          compare_at_price: body.comparePrice ?? null,
          stock: Math.max(0, Math.floor(body.stock)),
          category: body.category.trim(),
          status,
          net_content_ml: netContentMl,
          grams_per_ml: gramsPerMl,
          weight_override_g: weightOverrideG,
        })
        .select('id')
        .single()
      product = legacyInsert.data
      insertErr = legacyInsert.error
    }

    if (insertErr || !product) {
      console.error(insertErr)
      return NextResponse.json({ error: insertErr?.message ?? 'No se pudo crear el producto' }, { status: 500 })
    }

    const rows = body.images.map((img, i) => ({
      product_id: product.id,
      url: img.url,
      position: img.position ?? i,
      is_primary: i === 0,
    }))

    const { error: imgErr } = await supabaseServer.from('product_images').insert(rows)
    if (imgErr) {
      await supabaseServer.from('products').delete().eq('id', product.id)
      console.error(imgErr)
      return NextResponse.json({ error: imgErr.message }, { status: 500 })
    }

    if (body.shippingGroupId?.trim()) {
      const { error: groupErr } = await supabaseServer.from('product_shipping_groups').insert({
        product_id: product.id,
        shipping_group_id: body.shippingGroupId.trim(),
      })

      if (groupErr) {
        if (!isMissingShippingSchemaError(groupErr)) {
          console.error(groupErr)
          return NextResponse.json({ error: groupErr.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ ok: true, id: product.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
