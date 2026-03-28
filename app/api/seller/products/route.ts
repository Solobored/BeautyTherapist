import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { resolveBrandIdForSeller } from '@/lib/seller-server'
import { mapDbProductToProduct } from '@/lib/seller-product-map'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function sellerHeaders(request: NextRequest) {
  const email = request.headers.get('x-seller-email')?.trim() ?? ''
  const slug = request.headers.get('x-brand-slug')?.trim() ?? ''
  return { email, slug }
}

export async function GET(request: NextRequest) {
  try {
    const { email, slug } = sellerHeaders(request)
    if (!email) {
      return NextResponse.json({ error: 'Missing x-seller-email header' }, { status: 400 })
    }

    const brandId = await resolveBrandIdForSeller(
      supabaseServer,
      email,
      slug || email.split('@')[0]?.toLowerCase() || undefined
    )
    if (!brandId) {
      return NextResponse.json(
        { error: 'Marca no encontrada. Verifica el correo del vendedor o el slug de la marca en la base de datos.' },
        { status: 404 }
      )
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
        brands (brand_name, brand_slug),
        product_images (url, position, is_primary)
      `
      )
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('seller products GET:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const products = (data ?? []).map((row) => mapDbProductToProduct(row as Parameters<typeof mapDbProductToProduct>[0]))
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
  category: 'skincare' | 'makeup'
  price: number
  comparePrice?: number | null
  stock: number
  status: 'active' | 'draft' | 'inactive'
  images: { url: string; position: number }[]
}

export async function POST(request: NextRequest) {
  try {
    const { email, slug } = sellerHeaders(request)
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

    const body = (await request.json()) as CreateBody
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }
    if (!body.images || body.images.length < 1) {
      return NextResponse.json({ error: 'Al menos una imagen (WebP) es requerida' }, { status: 400 })
    }

    const name = body.name.trim()
    const desc = body.description?.trim() ?? ''
    const ing = body.ingredients?.trim() ?? ''
    const how = body.howToUse?.trim() ?? ''

    const status =
      body.status === 'draft' || body.status === 'inactive' || body.status === 'active'
        ? body.status
        : 'draft'

    const { data: product, error: insertErr } = await supabaseServer
      .from('products')
      .insert({
        brand_id: brandId,
        name_es: name,
        name_en: name,
        description_es: desc,
        description_en: desc,
        ingredients: ing,
        how_to_use: how,
        price: body.price,
        compare_at_price: body.comparePrice ?? null,
        stock: Math.max(0, Math.floor(body.stock)),
        category: body.category,
        status,
      })
      .select('id')
      .single()

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

    return NextResponse.json({ ok: true, id: product.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
