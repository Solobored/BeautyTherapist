export function isMissingShippingSchemaError(error: { message?: string | null; code?: string | null } | null | undefined) {
  const message = String(error?.message ?? '').toLowerCase()
  return (
    error?.code === '42703' ||
    message.includes('shipping_mode') ||
    message.includes('product_shipping_groups') ||
    message.includes('shipping_group_id')
  )
}
