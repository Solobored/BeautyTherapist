import { Resend } from 'resend'

const resend = () => new Resend(process.env.RESEND_API_KEY?.trim() || '')

export type EmailSendResult =
  | { sent: true; id?: string }
  | { sent: false; errorMessage?: string }

type OrderMailItem = {
  name: string
  quantity: number
  price: number
}

type SellerOrderMailItem = {
  name: string
  quantity: number
  price: number
}

function mailFrom() {
  return process.env.RESEND_FROM_EMAIL?.trim() || 'Beauty & Therapy <onboarding@resend.dev>'
}

function warnIfDefaultFrom(from: string, context: string) {
  if (from.includes('onboarding@resend.dev')) {
    console.warn(
      `[email] ${context}: RESEND_FROM_EMAIL no configurada; usando onboarding@resend.dev. ` +
        'Resend solo entrega desde ese remitente al email de la cuenta (pruebas). ' +
        'Para clientes y otros vendedores configura un dominio verificado y RESEND_FROM_EMAIL.'
    )
  }
}

async function deliverEmail(options: {
  to: string | string[]
  subject: string
  html: string
  logContext: string
}): Promise<EmailSendResult> {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    console.warn(`[email] ${options.logContext}: RESEND_API_KEY no configurada; no se envía.`)
    return { sent: false, errorMessage: 'RESEND_API_KEY no configurada' }
  }

  const from = mailFrom()
  warnIfDefaultFrom(from, options.logContext)

  try {
    const { data, error } = await resend().emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    if (error) {
      console.error(`[email] ${options.logContext}: Resend API`, error.name, error.message)
      return { sent: false, errorMessage: `${error.name}: ${error.message}` }
    }

    console.log(`[email] ${options.logContext}: aceptado por Resend, id=${data?.id ?? '(sin id)'}`)
    return { sent: true, id: data?.id }
  } catch (e) {
    console.error(`[email] ${options.logContext}: excepción`, e)
    return { sent: false, errorMessage: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

/** Estado de configuración (sin exponer la API key). Útil para diagnóstico en panel vendedor. */
export function getResendConfigSnapshot() {
  const hasApiKey = Boolean(process.env.RESEND_API_KEY?.trim())
  const customFrom = process.env.RESEND_FROM_EMAIL?.trim()
  const effectiveFrom = mailFrom()
  const usingDefaultFrom = !customFrom
  return {
    hasApiKey,
    usingDefaultFrom,
    effectiveFrom,
  }
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
}): Promise<EmailSendResult> {
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

  return deliverEmail({
    to: input.to,
    subject: 'Compra confirmada: ya recibimos tu pedido',
    html,
    logContext: 'compra confirmada (comprador)',
  })
}

export async function sendOrderConfirmedToSeller(input: {
  to: string
  sellerName: string
  buyerName: string
  buyerEmail: string
  orderId: string
  items: SellerOrderMailItem[]
  total: number
}): Promise<EmailSendResult> {
  const itemsHtml = input.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.name)} × ${item.quantity} — <strong>${escapeHtml(formatClp(item.price * item.quantity))}</strong></li>`
    )
    .join('')

  const html = `
    <p>Hola ${escapeHtml(input.sellerName)},</p>
    <p>Se confirmó una nueva compra de productos de tu tienda.</p>
    <p><strong>Código de pedido:</strong> ${escapeHtml(input.orderId)}</p>
    <p><strong>Comprador:</strong> ${escapeHtml(input.buyerName)} (${escapeHtml(input.buyerEmail)})</p>
    <p><strong>Productos vendidos:</strong></p>
    <ul>${itemsHtml}</ul>
    <p><strong>Total atribuido a este pedido:</strong> ${escapeHtml(formatClp(input.total))}</p>
    <p>Entra a tu panel para revisar los datos de envío y continuar con la preparación.</p>
  `

  return deliverEmail({
    to: input.to,
    subject: 'Nueva compra confirmada en tu tienda',
    html,
    logContext: 'compra confirmada (vendedor)',
  })
}

export async function sendOrderCancelledToBuyer(input: {
  to: string
  buyerName: string
  orderId: string
  refunded: boolean
  reason?: string
}): Promise<EmailSendResult> {
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

  return deliverEmail({
    to: input.to,
    subject,
    html,
    logContext: 'pedido anulado (comprador)',
  })
}

export async function sendOrderShippedToBuyer(input: {
  to: string
  buyerName: string
  orderId: string
}): Promise<EmailSendResult> {
  const html = `
    <p>Hola ${escapeHtml(input.buyerName)},</p>
    <p>Tu pedido <strong>${escapeHtml(input.orderId.slice(0, 8))}…</strong> fue marcado como <strong>enviado</strong>.</p>
    <p>Recibirás otra notificación cuando se entregue. Si tienes preguntas, responde a este correo.</p>
  `

  return deliverEmail({
    to: input.to,
    subject: 'Tu pedido está en camino',
    html,
    logContext: 'pedido enviado (comprador)',
  })
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
