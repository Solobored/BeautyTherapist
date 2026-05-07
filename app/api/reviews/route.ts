import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')?.trim()

    if (!productId) {
      return NextResponse.json({ error: 'productId es obligatorio' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('reviews')
      .select(
        `
        id,
        reviewer_name,
        rating,
        title,
        content,
        verified_purchase,
        helpful_count,
        created_at,
        referenced_product_id,
        referenced_product:products!reviews_referenced_product_id_fkey (
          id,
          name_es,
          name_en,
          product_images (url, position)
        )
      `
      )
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const reviews = (data ?? []).map((row) => {
      const referenced = Array.isArray(row.referenced_product)
        ? row.referenced_product[0]
        : row.referenced_product

      return {
        id: row.id,
        productId,
        reviewerName: row.reviewer_name,
        rating: row.rating,
        title: row.title,
        content: row.content,
        verifiedPurchase: row.verified_purchase ?? false,
        date: row.created_at,
        helpfulCount: row.helpful_count ?? 0,
        referencedProduct: referenced
          ? {
              id: referenced.id,
              name: referenced.name_es || referenced.name_en,
              imageUrl:
                referenced.product_images?.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]
                  ?.url ?? '/placeholder.svg',
              slug: referenced.id,
            }
          : undefined,
      }
    })

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0

    return NextResponse.json({
      reviews,
      averageRating,
      totalReviews: reviews.length,
    })
  } catch (error) {
    console.error('api/reviews GET', error)
    return NextResponse.json({ error: 'Error al cargar reseñas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      productId?: string
      reviewerName?: string
      rating?: number
      title?: string
      content?: string
      referencedProductId?: string | null
    }

    const productId = body.productId?.trim()
    const reviewerName = body.reviewerName?.trim()
    const content = body.content?.trim()

    if (!productId || !reviewerName || !content || !body.rating) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const { data: product, error: productError } = await supabaseServer
      .from('products')
      .select('brand_id')
      .eq('id', productId)
      .maybeSingle()

    if (productError || !product?.brand_id) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const { error } = await supabaseServer.from('reviews').insert({
      product_id: productId,
      brand_id: product.brand_id,
      reviewer_name: reviewerName,
      rating: Math.max(1, Math.min(5, Math.round(body.rating))),
      title: body.title?.trim() || null,
      content,
      referenced_product_id: body.referencedProductId?.trim() || null,
      verified_purchase: false,
      helpful_count: 0,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('api/reviews POST', error)
    return NextResponse.json({ error: 'Error al guardar reseña' }, { status: 500 })
  }
}
