import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
    const { error } = await supabaseServer
      .from('seller_categories')
      .delete()
      .eq('id', id)
      .eq('brand_id', session.brandId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('seller categories DELETE', error)
    return NextResponse.json({ error: 'No se pudo eliminar la categoría' }, { status: 500 })
  }
}
