ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS buyer_confirmation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS seller_notification_emails_sent TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN orders.buyer_confirmation_email_sent_at IS 'Fecha de envio del correo de compra al comprador';
COMMENT ON COLUMN orders.seller_notification_emails_sent IS 'Lista de correos de vendedores ya notificados para este pedido';
