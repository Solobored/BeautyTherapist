import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')?.trim()
    const search = searchParams.get('search')?.trim()
    const sellerOnly = searchParams.get('sellerOnly') === 'true'

    let query = supabaseServer
      .from('products')
      .select(
        `
        id,
        brand_id,
        name_es,
        name_en,
        price,
        status,
        product_images (url, position)
      `
      )
      .order('created_at', { ascending: false })
      .limit(20)

    if (brandId) {
      query = query.eq('brand_id', brandId)
    }

    if (!sellerOnly) {
      query = query.eq('status', 'active')
    }

    if (search) {
      query = query.or(`name_es.ilike.%${search}%,name_en.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const products = (data ?? []).map((row) => ({
      id: row.id,
      brandId: row.brand_id,
      name: row.name_es || row.name_en,
      imageUrl:
        row.product_images?.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url ??
        '/placeholder.svg',
      price: Number(row.price ?? 0),
      slug: row.id,
      status: row.status,
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error('api/products', error)
    return NextResponse.json({ error: 'Error al buscar productos' }, { status: 500 })
  }
}
