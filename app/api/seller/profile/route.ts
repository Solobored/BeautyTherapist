import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { resolveBrandIdForSeller } from '@/lib/seller-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null
  const cleaned = url.trim()
  if (!cleaned) return null
  if (!/^https?:\/\//i.test(cleaned)) {
    return `https://${cleaned}`
  }
  return cleaned
}

export async function GET(request: NextRequest) {
  const email = request.headers.get('x-seller-email')?.trim() ?? ''
  const slug = request.headers.get('x-brand-slug')?.trim() ?? ''

  if (!email) {
    return NextResponse.json({ error: 'Missing x-seller-email header' }, { status: 400 })
  }

  const brandId = await resolveBrandIdForSeller(supabaseServer, email, slug || undefined)
  if (!brandId) {
    return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
  }

  const { data, error } = await supabaseServer
    .from('brands')
    .select(
      'id, brand_name, brand_slug, description, logo_url, banner_url, facebook_url, instagram_url, tiktok_url'
    )
    .eq('id', brandId)
    .maybeSingle()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'No se pudo cargar la marca' }, { status: 500 })
  }

  return NextResponse.json({ brand: data })
}

export async function PUT(request: NextRequest) {
  const email = request.headers.get('x-seller-email')?.trim() ?? ''
  const slug = request.headers.get('x-brand-slug')?.trim() ?? ''

  if (!email) {
    return NextResponse.json({ error: 'Missing x-seller-email header' }, { status: 400 })
  }

  const brandId = await resolveBrandIdForSeller(supabaseServer, email, slug || undefined)
  if (!brandId) {
    return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 })
  }

  let body: Record<string, any> = {}
  try {
    body = (await request.json()) as Record<string, any>
  } catch {
    /* noop */
  }

  const update: Record<string, any> = {
    description: body.brandDescription ?? null,
    logo_url: body.brandLogo ?? null,
    banner_url: body.brandBanner ?? null,
    facebook_url: normalizeUrl(body.facebookUrl),
    instagram_url: normalizeUrl(body.instagramUrl),
    tiktok_url: normalizeUrl(body.tiktokUrl),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabaseServer.from('brands').update(update).eq('id', brandId)
  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'No se pudo actualizar la marca' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
