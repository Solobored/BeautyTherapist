import { Resend } from 'resend'

const resend = () => new Resend(process.env.RESEND_API_KEY?.trim() || '')

export async function sendOrderCancelledToBuyer(input: {
  to: string
  buyerName: string
  orderId: string
  refunded: boolean
  reason?: string
}) {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    console.warn('[email] RESEND_API_KEY no configurada; no se envía correo al comprador.')
    return { sent: false as const }
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || 'Beauty & Therapy <onboarding@resend.dev>'

  const subject = input.refunded
    ? 'Tu pedido fue anulado — reembolso en proceso'
    : 'Tu pedido fue anulado'

  const refundHtml = input.refunded
    ? '<p>Si el pago ya había sido acreditado, iniciamos el <strong>reembolso por Mercado Pago</strong>. Puede tardar varios días hábiles según tu banco o medio de pago.</p>'
    : '<p>No se registró cobro completado para este pedido, no hay devolución monetaria asociada.</p>'

  const reasonBlock = input.reason
    ? `<p><strong>Motivo indicado por la tienda:</strong> ${escapeHtml(input.reason)}</p>`
    : ''

  const html = `
    <p>Hola ${escapeHtml(input.buyerName)},</p>
    <p>Tu pedido <strong>${escapeHtml(input.orderId.slice(0, 8))}…</strong> fue <strong>anulado</strong> por el vendedor.</p>
    ${refundHtml}
    ${reasonBlock}
    <p>Si no reconoces esta acción, responde a este correo o contacta al soporte de la tienda.</p>
  `

  try {
    await resend().emails.send({
      from,
      to: input.to,
      subject,
      html,
    })
    return { sent: true as const }
  } catch (e) {
    console.error('[email] Resend error', e)
    return { sent: false as const }
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
