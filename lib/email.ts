import { Resend } from 'resend'

const resend = () => new Resend(process.env.RESEND_API_KEY?.trim() || '')

type OrderMailItem = {
  name: string
  quantity: number
  price: number
}

function mailFrom() {
  return process.env.RESEND_FROM_EMAIL?.trim() || 'Beauty & Therapy <onboarding@resend.dev>'
}

function formatClp(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)
}

export async function sendOrderConfirmedToBuyer(input: {
  to: string
  buyerName: string
  orderId: string
  items: OrderMailItem[]
  total: number
}) {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    console.warn('[email] RESEND_API_KEY no configurada; no se envía correo de compra confirmada.')
    return { sent: false as const }
  }

  const itemsHtml = input.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.name)} × ${item.quantity} — <strong>${escapeHtml(formatClp(item.price * item.quantity))}</strong></li>`
    )
    .join('')

  const html = `
    <p>Hola ${escapeHtml(input.buyerName)},</p>
    <p>Tu compra fue <strong>confirmada correctamente</strong>.</p>
    <p><strong>Código de pedido:</strong> ${escapeHtml(input.orderId)}</p>
    <p><strong>Resumen:</strong></p>
    <ul>${itemsHtml}</ul>
    <p><strong>Total pagado:</strong> ${escapeHtml(formatClp(input.total))}</p>
    <p>Usa este código para hacer seguimiento de tu pedido y para cualquier consulta con la tienda.</p>
    <p>Te iremos notificando por correo cuando el vendedor prepare y envíe tu compra.</p>
  `

  try {
    await resend().emails.send({
      from: mailFrom(),
      to: input.to,
      subject: 'Compra confirmada: ya recibimos tu pedido',
      html,
    })
    return { sent: true as const }
  } catch (e) {
    console.error('[email] Resend error (confirmed)', e)
    return { sent: false as const }
  }
}

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
      from: mailFrom(),
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

export async function sendOrderShippedToBuyer(input: {
  to: string
  buyerName: string
  orderId: string
}) {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    console.warn('[email] RESEND_API_KEY no configurada; no se envía correo al comprador (shipped).')
    return { sent: false as const }
  }

  const html = `
    <p>Hola ${escapeHtml(input.buyerName)},</p>
    <p>Tu pedido <strong>${escapeHtml(input.orderId.slice(0, 8))}…</strong> fue marcado como <strong>enviado</strong>.</p>
    <p>Recibirás otra notificación cuando se entregue. Si tienes preguntas, responde a este correo.</p>
  `

  try {
    await resend().emails.send({
      from: mailFrom(),
      to: input.to,
      subject: 'Tu pedido está en camino',
      html,
    })
    return { sent: true as const }
  } catch (e) {
    console.error('[email] Resend error (shipped)', e)
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
