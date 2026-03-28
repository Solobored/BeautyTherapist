import { supabaseServer } from '@/lib/supabase'

export type OrderLineJson = { product_id?: string; quantity?: number }

export async function decrementStockForOrderLines(lines: OrderLineJson[]) {
  for (const line of lines) {
    const pid = line.product_id
    const qty = line.quantity ?? 0
    if (!pid || qty <= 0) continue
    const { data: row, error } = await supabaseServer.from('products').select('stock').eq('id', pid).single()
    if (error || !row) continue
    await supabaseServer
      .from('products')
      .update({ stock: Math.max(0, Number(row.stock) - qty) })
      .eq('id', pid)
  }
}

export async function incrementStockForOrderLines(lines: OrderLineJson[]) {
  for (const line of lines) {
    const pid = line.product_id
    const qty = line.quantity ?? 0
    if (!pid || qty <= 0) continue
    const { data: row, error } = await supabaseServer.from('products').select('stock').eq('id', pid).single()
    if (error || !row) continue
    await supabaseServer
      .from('products')
      .update({ stock: Number(row.stock) + qty })
      .eq('id', pid)
  }
}
