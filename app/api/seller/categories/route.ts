import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function slugifyCategory(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
    }

    const { data, error } = await supabaseServer
      .from('seller_categories')
      .select('id, name, slug, created_at')
      .eq('brand_id', session.brandId)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ categories: data ?? [] })
  } catch (error) {
    console.error('seller categories GET', error)
    return NextResponse.json({ error: 'No se pudieron cargar las categorías' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as { name?: string }
    const name = body.name?.trim().replace(/\s+/g, ' ')
    if (!name || name.length < 2 || name.length > 60) {
      return NextResponse.json({ error: 'La categoría debe tener entre 2 y 60 caracteres' }, { status: 400 })
    }

    const slug = slugifyCategory(name)
    if (!slug) {
      return NextResponse.json({ error: 'Nombre de categoría inválido' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('seller_categories')
      .insert({
        brand_id: session.brandId,
        name,
        slug,
      })
      .select('id, name, slug, created_at')
      .single()

    if (error) {
      const alreadyExists = String(error.message ?? '').toLowerCase().includes('duplicate')
      return NextResponse.json(
        { error: alreadyExists ? 'Esta categoría ya existe' : error.message },
        { status: alreadyExists ? 409 : 500 }
      )
    }

    return NextResponse.json({ category: data }, { status: 201 })
  } catch (error) {
    console.error('seller categories POST', error)
    return NextResponse.json({ error: 'No se pudo crear la categoría' }, { status: 500 })
  }
}
