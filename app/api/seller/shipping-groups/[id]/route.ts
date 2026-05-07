import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { getSellerSessionFromRequest } from '@/lib/seller-session-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function sellerOwnsGroup(groupId: string, sellerId: string) {
  const { data } = await supabaseServer
    .from('shipping_groups')
    .select('id')
    .eq('id', groupId)
    .eq('seller_id', sellerId)
    .maybeSingle()

  return Boolean(data?.id)
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const { id } = await context.params
    if (!(await sellerOwnsGroup(id, session.sellerId))) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const patch = {
      name: String(body.name ?? '').trim(),
      carrier:
        body.carrier === 'blue_express' || body.carrier === 'chile_express'
          ? body.carrier
          : 'custom',
      rate_rm: body.rate_rm ?? null,
      rate_sur: body.rate_sur ?? null,
      rate_norte: body.rate_norte ?? null,
      rate_extremo: body.rate_extremo ?? null,
      rate_prioritario: body.rate_prioritario ?? null,
      free_shipping_threshold: body.free_shipping_threshold ?? null,
      eta_rm: body.eta_rm ?? '1-2 dias habiles',
      eta_sur: body.eta_sur ?? '3-5 dias habiles',
      eta_norte: body.eta_norte ?? '4-6 dias habiles',
      eta_extremo: body.eta_extremo ?? '8-12 dias habiles',
      notes: body.notes ?? null,
      active: body.active ?? true,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabaseServer.from('shipping_groups').update(patch).eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('shipping-groups PUT', error)
    return NextResponse.json({ error: 'Error al actualizar grupo' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSellerSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'Sesion de vendedor no valida.' }, { status: 401 })
    }

    const { id } = await context.params
    if (!(await sellerOwnsGroup(id, session.sellerId))) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })
    }

    const { data: assignments, error: assignmentError } = await supabaseServer
      .from('product_shipping_groups')
      .select('product_id')
      .eq('shipping_group_id', id)

    if (assignmentError) {
      return NextResponse.json({ error: assignmentError.message }, { status: 500 })
    }

    const assignedProductIds = (assignments ?? []).map((row) => row.product_id)
    if (assignedProductIds.length > 0) {
      await supabaseServer
        .from('products')
        .update({
          shipping_mode: 'blue_express',
          updated_at: new Date().toISOString(),
        })
        .in('id', assignedProductIds)

      await supabaseServer.from('product_shipping_groups').delete().eq('shipping_group_id', id)
    }

    const { error } = await supabaseServer.from('shipping_groups').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, reassignedProducts: assignedProductIds.length })
  } catch (error) {
    console.error('shipping-groups DELETE', error)
    return NextResponse.json({ error: 'Error al eliminar grupo' }, { status: 500 })
  }
}
