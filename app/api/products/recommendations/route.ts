import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import {
  buildSkinProfileText,
  getAnalysisTagSlugs,
  isSkinSessionToken,
  rankRelevantBlogPosts,
  rankSkinProductMatches,
  scoreProductTextForSkinProfile,
  scoreSkinTagMatches,
} from '@/lib/skin-analysis'
import { mapDbProductToProduct } from '@/lib/seller-product-map'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PRODUCT_SELECT = `
  id, brand_id, name_en, name_es, description_en, description_es,
  ingredients, how_to_use, price, compare_at_price, stock, category, status,
  net_content_ml, grams_per_ml, weight_override_g, shipping_mode, skin_notes, created_at,
  brands (brand_name, brand_slug),
  product_images (url, position, is_primary)
`

function normalizeBlogPostRow(post: Record<string, unknown>) {
  return {
    id: String(post.id ?? ''),
    slug: String(post.slug ?? ''),
    title: (post.title_es as string | null) || (post.title_en as string | null) || 'Artículo',
    content: (post.content_es as string | null) || (post.content_en as string | null) || '',
    coverImage: (post.cover_image as string | null) ?? '/placeholder.svg',
    category: (post.category as string | null) || 'wellness',
    author: (post.author as string | null) || 'BeautyTherapist',
    publishedAt: (post.published_at as string | null) ?? (post.created_at as string | null) ?? new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const analysisId = request.nextUrl.searchParams.get('analysisId')
    const sessionToken = request.nextUrl.searchParams.get('sessionToken') ?? request.headers.get('x-skin-session')
    if (!analysisId || !isSkinSessionToken(sessionToken)) {
      return NextResponse.json({ error: 'Análisis o sesión inválidos' }, { status: 400 })
    }

    const { data: analysis, error: analysisError } = await supabaseServer
      .from('skin_analyses')
      .select('id, skin_type, concerns, goals, notes, source, report_file_url, ai_observations, user_id, expires_at')
      .eq('id', analysisId)
      .eq('session_token', sessionToken)
      .maybeSingle()
    if (analysisError) {
      console.error('product recommendations analysis lookup', analysisError)
      return NextResponse.json({ error: 'No se pudieron cargar las recomendaciones' }, { status: 500 })
    }
    if (!analysis) return NextResponse.json({ error: 'Análisis no encontrado' }, { status: 404 })
    if (!analysis.user_id && Date.parse(analysis.expires_at) <= Date.now()) {
      return NextResponse.json({ error: 'Este análisis ha vencido' }, { status: 410 })
    }

    const requestedSlugs = getAnalysisTagSlugs({
      skinType: analysis.skin_type,
      concerns: analysis.concerns ?? [],
      goals: analysis.goals ?? [],
    })
    const profileText = buildSkinProfileText(analysis.skin_type, analysis.concerns ?? [], analysis.goals ?? [], analysis.notes ?? null)

    const { data: blogRows, error: blogError } = await supabaseServer
      .from('blog_posts')
      .select('id, slug, title_es, title_en, content_es, content_en, cover_image, category, author, published_at, created_at')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(12)
    if (blogError) {
      console.error('blog recommendations lookup', blogError)
    }

    const blogPosts = blogRows && blogRows.length > 0
      ? rankRelevantBlogPosts(profileText, blogRows.map((post) => normalizeBlogPostRow(post as Record<string, unknown>))).map((post) => ({
          id: post.id,
          slug: post.slug,
          title: post.title,
          content: post.content,
          coverImage: post.coverImage,
          category: post.category,
          author: post.author,
          publishedAt: post.publishedAt,
        }))
      : []

    if (analysis.source === 'professional_report' && requestedSlugs.length === 0) {
      const { data, error } = await supabaseServer
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12)
      if (error) throw error
      return NextResponse.json({
        mode: 'review-with-specialist',
        analysis: {
          id: analysis.id,
          reportFileUrl: analysis.report_file_url,
          aiObservations: analysis.ai_observations,
        },
        products: (data ?? []).map((row) => mapDbProductToProduct(row as Parameters<typeof mapDbProductToProduct>[0])),
        blogPosts,
      })
    }

    let products: ReturnType<typeof mapDbProductToProduct>[] = []

    if (requestedSlugs.length > 0) {
      const { data: tags, error: tagsError } = await supabaseServer
        .from('skin_tags')
        .select('id, slug')
        .in('slug', requestedSlugs)
      if (tagsError) throw tagsError
      const tagById = new Map((tags ?? []).map((tag) => [tag.id, tag.slug]))

      if (tagById.size > 0) {
        const { data: links, error: linksError } = await supabaseServer
          .from('product_skin_tags')
          .select('product_id, skin_tag_id')
          .in('skin_tag_id', [...tagById.keys()])
        if (linksError) throw linksError

        const matchedByProduct = new Map<string, string[]>()
        for (const link of links ?? []) {
          const slug = tagById.get(link.skin_tag_id)
          if (!slug) continue
          matchedByProduct.set(link.product_id, [...(matchedByProduct.get(link.product_id) ?? []), slug])
        }

        const productIds = [...matchedByProduct.keys()]
        if (productIds.length > 0) {
          const { data, error } = await supabaseServer
            .from('products')
            .select(PRODUCT_SELECT)
            .eq('status', 'active')
            .in('id', productIds)
            .order('created_at', { ascending: false })
            .limit(100)
          if (error) throw error

          products = rankSkinProductMatches((data ?? [])
            .map((row) => ({
              product: mapDbProductToProduct(row as Parameters<typeof mapDbProductToProduct>[0]),
              score: scoreSkinTagMatches(matchedByProduct.get(row.id) ?? [], requestedSlugs),
              createdAt: row.created_at,
            }))
            .filter((item) => item.score > 0))
        }
      }
    }

    if (products.length === 0) {
      const { data, error } = await supabaseServer
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(40)
      if (error) throw error

      products = rankSkinProductMatches((data ?? [])
        .map((row) => ({
          product: mapDbProductToProduct(row as Parameters<typeof mapDbProductToProduct>[0]),
          score: scoreProductTextForSkinProfile(
            profileText,
            [
              row.name_en,
              row.name_es,
              row.description_en,
              row.description_es,
              row.ingredients,
              row.how_to_use,
              row.skin_notes,
            ]
              .filter(Boolean)
              .join(' '),
          ),
          createdAt: row.created_at,
        }))
        .filter((item) => item.score > 0))
        .slice(0, 8)
    }

    return NextResponse.json({
      mode: 'matched',
      analysis: { id: analysis.id, aiObservations: analysis.ai_observations },
      products,
      blogPosts,
    })
  } catch (error) {
    console.error('product recommendations GET', error)
    return NextResponse.json({ error: 'No se pudieron cargar las recomendaciones' }, { status: 500 })
  }
}