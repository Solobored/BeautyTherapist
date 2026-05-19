import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSellerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Sesión de vendedor no válida.' }, { status: 401 })
  }

  const { id } = await context.params
  const body = (await request.json().catch(() => ({}))) as {
    isActive?: boolean
  }

  if (typeof body.isActive !== 'boolean') {
    return NextResponse.json({ error: 'No hay cambios válidos para guardar.' }, { status: 400 })
  }

  const { error } = await supabaseServer
    .from('coupons')
    .update({
      is_active: body.isActive,
    })
    .eq('id', id)
    .eq('brand_id', session.brandId)

  if (error) {
    console.error('seller coupon patch', error)
    return NextResponse.json({ error: 'No se pudo actualizar el cupón.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
