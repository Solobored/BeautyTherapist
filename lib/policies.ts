export type PolicyPage = {
  slug: string
  title: string
  description: string
  updatedAt: string
  sections: Array<{
    title: string
    body: string[]
  }>
}

export const policyPages: PolicyPage[] = [
  {
    slug: 'privacidad',
    title: 'Política de privacidad',
    description:
      'Conoce cómo Beauty & Therapy trata datos personales, pedidos, medios de contacto y seguridad de la información, conforme a la Ley 21.719.',
    updatedAt: '2026-07-31',
    sections: [
      {
        title: 'Responsable del tratamiento',
        body: [
          'Beauty & Therapy [RAZÓN SOCIAL] [RUT], con domicilio en [DIRECCIÓN, COMUNA, CHILE], es responsable del tratamiento de los datos personales recolectados a través de este sitio.',
          'Puedes contactar a nuestro Delegado de Protección de Datos (DPO) en [dpo@beautytherapy.cl] para cualquier consulta, reclamo o solicitud relacionada con tus datos personales.',
        ],
      },
      {
        title: 'Datos que tratamos y base legal',
        body: [
          'Datos de identificación y contacto (nombre, correo, teléfono, dirección de despacho): tratados con base en la ejecución del contrato de compraventa cuando realizas un pedido, o tu consentimiento al crear una cuenta.',
          'Fecha de nacimiento (opcional): tratada solo con tu consentimiento, exclusivamente para enviarte un cupón de cumpleaños. Puedes omitir este dato sin afectar tu compra.',
          'Historial de pedidos y mensajes de soporte: tratados con base en la ejecución del contrato y nuestro interés legítimo en prevenir fraude y mejorar el servicio.',
          'No solicitamos ni almacenamos datos de tarjetas de pago. Los pagos son procesados directamente por Mercado Pago bajo sus propias políticas de seguridad y privacidad.',
          'No tratamos categorías especiales de datos (salud, biometría, origen étnico, afiliación sindical, datos de menores de edad) salvo que tú los entregues voluntariamente en un mensaje de soporte; en ese caso los eliminamos si no son necesarios para resolver tu solicitud.',
        ],
      },
      {
        title: 'Finalidades del tratamiento',
        body: [
          'Crear y administrar tu cuenta, procesar compras, coordinar despachos y emitir comprobantes.',
          'Comunicaciones operativas sobre tu pedido (confirmación, envío, problemas de stock, garantía o devolución).',
          'Comunicaciones de marketing (newsletter, ofertas) solo si diste tu consentimiento expreso al suscribirte; puedes retirarlo en cualquier momento.',
          'Prevención de fraude, seguridad de la plataforma y cumplimiento de obligaciones legales y tributarias.',
          'Métricas agregadas y estadísticas de uso del sitio, sin identificarte individualmente.',
        ],
      },
      {
        title: 'Plazo de conservación',
        body: [
          'Datos de cuenta: mientras mantengas tu cuenta activa. Puedes solicitar su eliminación en cualquier momento.',
          'Datos de pedidos, boletas y comprobantes: se conservan por el plazo legal exigido en materia tributaria y comercial en Chile (generalmente hasta 6 años), aun si eliminas tu cuenta.',
          'Datos de marketing (newsletter): hasta que retires tu consentimiento.',
          'Solicitudes de soporte: hasta 2 años desde su resolución, para efectos de trazabilidad y garantía.',
        ],
      },
      {
        title: 'Con quién compartimos tus datos',
        body: [
          'Con la marca vendedora correspondiente, solo la información necesaria para preparar y despachar tu pedido.',
          'Con proveedores tecnológicos que actúan como encargados de tratamiento bajo contrato: hosting y base de datos (Supabase), infraestructura y analítica (Vercel), procesamiento de pagos (Mercado Pago), envío de correos transaccionales y almacenamiento de imágenes/video.',
          'No vendemos ni arrendamos tus datos personales a terceros para fines publicitarios ajenos a Beauty & Therapy.',
        ],
      },
      {
        title: 'Transferencias internacionales',
        body: [
          'Algunos de nuestros proveedores tecnológicos (hosting, base de datos, infraestructura en la nube) procesan datos en servidores ubicados fuera de Chile.',
          'En esos casos, exigimos contractualmente a nuestros proveedores medidas de seguridad y confidencialidad equivalentes a las exigidas por la ley chilena para el tratamiento de tus datos.',
        ],
      },
      {
        title: 'Tus derechos (ARCO+)',
        body: [
          'Puedes ejercer en cualquier momento y de forma gratuita tus derechos de Acceso, Rectificación, Cancelación/Supresión, Oposición, Portabilidad y Bloqueo temporal de tus datos.',
          'Para ejercerlos, completa el formulario en Ejercicio de derechos ARCO+ o escríbenos a [dpo@beautytherapy.cl] indicando tu nombre, correo asociado a tu cuenta y el derecho que deseas ejercer.',
          'Responderemos tu solicitud dentro de un plazo razonable y, en todo caso, dentro de los plazos que establece la Ley 21.719. Podremos pedirte antecedentes adicionales para verificar tu identidad antes de dar curso a la solicitud.',
          'Si no estás conforme con nuestra respuesta, puedes reclamar ante la Agencia de Protección de Datos Personales de Chile.',
        ],
      },
      {
        title: 'Seguridad de la información',
        body: [
          'Aplicamos medidas técnicas y organizativas razonables (cifrado en tránsito, control de accesos, registro de actividad) para proteger tus datos frente a accesos no autorizados, pérdida o alteración.',
          'Ante una vulneración de seguridad que afecte tus datos personales, notificaremos a la Agencia de Protección de Datos Personales dentro de las 72 horas siguientes a tomar conocimiento del incidente y, si existe riesgo alto para ti, también te notificaremos directamente sin dilación indebida.',
        ],
      },
      {
        title: 'Menores de edad',
        body: [
          'Este sitio está dirigido a personas mayores de 18 años. No recolectamos intencionalmente datos de menores de edad sin el consentimiento verificable de su representante legal.',
        ],
      },
      {
        title: 'Cookies',
        body: [
          'Usamos cookies esenciales y de analítica agregada. Puedes ver el detalle completo en nuestra Política de Cookies y gestionar tus preferencias desde el aviso que aparece en tu primera visita.',
        ],
      },
      {
        title: 'Cambios a esta política',
        body: [
          'Podemos actualizar esta política para reflejar cambios legales, operativos o tecnológicos. Publicaremos la fecha de la última actualización en esta misma página.',
        ],
      },
    ],
  },
  {
    slug: 'compra-venta',
    title: 'Políticas de compra y venta',
    description:
      'Condiciones generales para comprar productos de belleza en Beauty & Therapy y vender como marca dentro del marketplace.',
    updatedAt: '2026-06-02',
    sections: [
      {
        title: 'Información de productos y precios',
        body: [
          'Los productos deben mostrar precio en pesos chilenos, descripción, stock disponible, marca, imágenes referenciales y condiciones relevantes de despacho.',
          'Beauty & Therapy puede corregir errores evidentes de publicación, precio, stock o descripción antes de confirmar una venta, informando al cliente cuando corresponda.',
        ],
      },
      {
        title: 'Confirmación de compra',
        body: [
          'La compra se entiende confirmada cuando el pago es aprobado y el sistema genera la orden correspondiente.',
          'Si un producto queda sin stock luego de pagar, se ofrecerá una solución razonable: devolución del dinero, cambio por producto equivalente si el cliente acepta, o despacho parcial cuando sea posible.',
        ],
      },
      {
        title: 'Obligaciones de vendedores',
        body: [
          'Cada vendedor debe publicar productos originales, seguros, permitidos para comercialización y con información clara sobre uso, ingredientes, restricciones y stock.',
          'El vendedor debe cumplir los plazos de preparación y las políticas de garantía, retracto y devolución aplicables a consumidores en Chile.',
        ],
      },
      {
        title: 'Uso responsable del sitio',
        body: [
          'No se permite intentar vulnerar cuentas, automatizar compras abusivas, manipular reseñas, publicar información falsa o usar la plataforma para fines ilícitos.',
          'Beauty & Therapy puede suspender publicaciones, cuentas o pedidos si detecta riesgo de fraude, uso indebido, incumplimiento legal o afectación a clientes.',
        ],
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'Política de Cookies',
    description: 'Qué cookies usa Beauty & Therapy, para qué y cómo puedes gestionarlas.',
    updatedAt: '2026-07-31',
    sections: [
      {
        title: '¿Qué son las cookies?',
        body: [
          'Son pequeños archivos que el sitio guarda en tu navegador para recordar información entre visitas, como tu sesión de compra o el contenido de tu carrito.',
        ],
      },
      {
        title: 'Cookies que usamos',
        body: [
          'Esenciales: mantienen tu sesión iniciada, tu carrito de compras y el proceso de pago con Mercado Pago. Sin estas, el sitio no funciona correctamente y no requieren consentimiento previo.',
          'Analítica: usamos Vercel Analytics para medir visitas y uso agregado del sitio, sin identificarte individualmente. Puedes rechazarlas desde el aviso de cookies sin afectar la compra.',
        ],
      },
      {
        title: 'Cómo gestionar tus preferencias',
        body: [
          'Puedes aceptar o rechazar cookies no esenciales desde el aviso que aparece en tu primera visita, y cambiar tu elección borrando los datos de navegación de tu navegador para este sitio.',
          'La mayoría de los navegadores permite bloquear o eliminar cookies desde su configuración de privacidad.',
        ],
      },
    ],
  },
  {
    slug: 'devoluciones',
    title: 'Política de cambios, devoluciones y garantía',
    description:
      'Condiciones para cambios, devoluciones, derecho a retracto y garantía legal en compras de belleza en Chile.',
    updatedAt: '2026-06-02',
    sections: [
      {
        title: 'Garantía legal',
        body: [
          'Si un producto nuevo presenta fallas, no sirve para el uso informado, está incompleto o no corresponde a lo ofrecido, el consumidor puede ejercer la garantía legal dentro de 6 meses desde la recepción.',
          'En esos casos, la persona puede elegir entre reparación, cambio o devolución del dinero, según corresponda y de acuerdo con la Ley del Consumidor en Chile.',
        ],
      },
      {
        title: 'Derecho a retracto en compras online',
        body: [
          'En compras realizadas por internet, el cliente puede solicitar retracto dentro de 10 días desde la recepción del producto cuando este derecho sea aplicable.',
          'Por higiene y seguridad, productos cosméticos, maquillaje, skincare u otros artículos de uso personal deben devolverse sin uso, sellados, con embalaje original y accesorios completos cuando corresponda.',
        ],
      },
      {
        title: 'Productos que no pueden devolverse por gusto',
        body: [
          'No se aceptan devoluciones por gusto, cambio de opinión o error de elección cuando el producto fue abierto, usado, probado, manipulado o perdió su sello de seguridad, salvo que exista falla o incumplimiento legal.',
          'Tampoco se aceptan productos dañados por mal uso, almacenamiento inadecuado, exposición al calor, vencimiento causado por el cliente o uso distinto al indicado.',
        ],
      },
      {
        title: 'Cómo solicitar ayuda',
        body: [
          'Para solicitar cambio, devolución o garantía, conserva boleta, comprobante de pago, número de pedido, fotos del producto y una descripción clara del problema.',
          'El equipo revisará el caso y coordinará con la marca vendedora una respuesta razonable, priorizando el cumplimiento de la normativa chilena y una buena experiencia de compra.',
        ],
      },
    ],
  },
]

export function getPolicyPage(slug: string) {
  return policyPages.find((page) => page.slug === slug) ?? null
}
