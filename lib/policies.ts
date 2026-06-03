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
      'Conoce cómo Beauty & Therapy trata datos personales, pedidos, medios de contacto y seguridad de la información.',
    updatedAt: '2026-06-02',
    sections: [
      {
        title: 'Datos que podemos tratar',
        body: [
          'Podemos tratar datos necesarios para operar la tienda: nombre, correo, teléfono, dirección de despacho, información de pedidos, mensajes de soporte y preferencias de cuenta.',
          'No almacenamos datos completos de tarjetas. Los pagos son procesados por proveedores externos como Mercado Pago bajo sus propias medidas de seguridad.',
        ],
      },
      {
        title: 'Finalidades',
        body: [
          'Usamos la información para crear cuentas, procesar compras, coordinar despachos, emitir comunicaciones operativas, prevenir fraude, responder solicitudes y mejorar la experiencia del sitio.',
          'Podemos usar datos agregados o estadísticos para métricas internas sin identificar directamente a una persona.',
        ],
      },
      {
        title: 'Comunicación con vendedores y proveedores',
        body: [
          'Cuando una compra involucra productos de una marca vendedora, compartimos solo la información necesaria para preparar, despachar o resolver el pedido.',
          'Los proveedores tecnológicos que usamos para hosting, pagos, correo, almacenamiento de imágenes o analítica solo deben tratar datos para prestar esos servicios.',
        ],
      },
      {
        title: 'Derechos de las personas',
        body: [
          'Puedes solicitar acceso, rectificación, actualización o eliminación de tus datos cuando corresponda, escribiendo a los canales de contacto del sitio.',
          'Por obligaciones contables, de seguridad o defensa ante reclamos, ciertos antecedentes de compra pueden conservarse por el tiempo legal o razonablemente necesario.',
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
