'use client'

import { createContext, useContext, type ReactNode } from 'react'

const translations: Record<string, string> = {
  // Navigation
  'nav.home': 'Inicio',
  'nav.shop': 'Tienda',
  'nav.brands': 'Marcas',
  'nav.blog': 'Blog',
  'nav.about': 'Nosotros',
  'nav.login': 'Iniciar Sesion',
  'nav.register': 'Registrarse',
  'nav.seller': 'Vendedor',
  'nav.myAccount': 'Mi Cuenta',
  'nav.myOrders': 'Mis Pedidos',
  'nav.myCoupons': 'Mis Cupones',
  'nav.wishlist': 'Lista de Deseos',
  'nav.addresses': 'Direcciones',
  'nav.settings': 'Configuracion',
  'nav.logout': 'Cerrar Sesion',
  
  // Hero
  'hero.tagline': 'Donde la belleza encuentra su esencia',
  'hero.shopNow': 'Comprar Ahora',
  'hero.sellWithUs': 'Vende con Nosotros',
  
  // Featured Products
  'featured.title': 'Nuevos Productos',
  'featured.all': 'Todos',
  'featured.skincare': 'Skincare',
  'featured.makeup': 'Maquillaje',
  'featured.addToCart': 'Agregar al Carrito',
  
  // Brands
  'brands.title': 'Nuestras Marcas',
  'brands.viewStore': 'Ver Tienda',
  
  // Testimonials
  'testimonials.title': 'Lo Que Dicen Nuestros Clientes',
  
  // Blog
  'blog.title': 'Tips & Rituales de Belleza',
  'blog.readMore': 'Leer Más',
  
  // Footer
  'footer.tagline': 'Tu destino de belleza premium',
  'footer.shop': 'Tienda',
  'footer.sellWithUs': 'Vende con Nosotros',
  'footer.faq': 'Preguntas Frecuentes',
  'footer.contact': 'Contacto',
  'footer.privacy': 'Política de Privacidad',
  'footer.newsletter': 'Suscríbete al Newsletter',
  'footer.emailPlaceholder': 'Tu correo electrónico',
  'footer.subscribe': 'Suscribirse',
  
  // Shop
  'shop.title': 'Tienda',
  'shop.search': 'Buscar productos...',
  'shop.filters': 'Filtros',
  'shop.category': 'Categoría',
  'shop.brand': 'Marca',
  'shop.priceRange': 'Rango de Precio',
  'shop.rating': 'Calificación',
  'shop.sortBy': 'Ordenar por',
  'shop.newest': 'Más Nuevos',
  'shop.priceLowHigh': 'Precio: Menor a Mayor',
  'shop.priceHighLow': 'Precio: Mayor a Menor',
  'shop.mostPopular': 'Más Popular',
  'shop.clearFilters': 'Limpiar Filtros',
  
  // Product Detail
  'product.addToCart': 'Agregar al Carrito',
  'product.buyNow': 'Comprar Ahora',
  'product.description': 'Descripción',
  'product.ingredients': 'Ingredientes',
  'product.howToUse': 'Cómo Usar',
  'product.inStock': 'En Stock',
  'product.lowStock': 'Pocas Unidades',
  'product.outOfStock': 'Agotado',
  'product.relatedProducts': 'Productos Relacionados',
  'product.reviews': 'Reseñas',
  
  // Cart
  'cart.title': 'Tu Carrito',
  'cart.empty': 'Tu carrito está vacío',
  'cart.subtotal': 'Subtotal',
  'cart.shipping': 'Envío',
  'cart.total': 'Total',
  'cart.checkout': 'Proceder al Pago',
  'cart.continueShopping': 'Continuar Comprando',
  
  // Checkout
  'checkout.title': 'Finalizar Compra',
  'checkout.shipping': 'Información de Envío',
  'checkout.payment': 'Método de Pago',
  'checkout.fullName': 'Nombre Completo',
  'checkout.email': 'Correo Electrónico',
  'checkout.phone': 'Teléfono',
  'checkout.address': 'Dirección',
  'checkout.city': 'Ciudad',
  'checkout.state': 'Estado/Provincia',
  'checkout.zip': 'Código Postal',
  'checkout.country': 'País',
  'checkout.deliveryMethod': 'Método de Entrega',
  'checkout.standard': 'Estándar (5-7 días)',
  'checkout.express': 'Express (2-3 días)',
  'checkout.creditCard': 'Tarjeta de Crédito/Débito',
  'checkout.paypal': 'PayPal',
  'checkout.bankTransfer': 'Transferencia Bancaria',
  'checkout.placeOrder': 'Realizar Pedido',
  'checkout.orderSummary': 'Resumen del Pedido',
  'checkout.createAccount': 'Crear cuenta para seguir tu pedido',
  
  // Order Confirmation
  'confirmation.title': '¡Pedido Confirmado!',
  'confirmation.message': 'Gracias por tu compra. Te enviaremos un correo con los detalles.',
  'confirmation.orderNumber': 'Número de Pedido',
  
  // Seller Auth
  'seller.login': 'Iniciar Sesión',
  'seller.register': 'Registrar Marca',
  'seller.brandName': 'Nombre de la Marca',
  'seller.ownerName': 'Nombre del Propietario',
  'seller.email': 'Correo Electrónico',
  'seller.password': 'Contraseña',
  'seller.confirmPassword': 'Confirmar Contraseña',
  'seller.phone': 'Teléfono',
  'seller.country': 'País',
  'seller.terms': 'Acepto los Términos y Condiciones',
  'seller.createAccount': 'Crear Cuenta de Vendedor',
  'seller.forgotPassword': '¿Olvidaste tu contraseña?',
  'seller.alreadyHaveAccount': '¿Ya tienes cuenta?',
  'seller.noAccount': '¿No tienes cuenta?',
  
  // Dashboard
  'dashboard.welcome': 'Bienvenido de vuelta',
  'dashboard.addProduct': 'Agregar Producto',
  'dashboard.viewStore': 'Ver Tienda',
  'dashboard.logout': 'Cerrar Sesión',
  'dashboard.totalRevenue': 'Ingresos Totales',
  'dashboard.totalSales': 'Ventas Totales',
  'dashboard.availableStock': 'Stock Disponible',
  'dashboard.mostViewed': 'Más Vistos',
  'dashboard.bestSelling': 'Más Vendidos',
  'dashboard.recentOrders': 'Pedidos Recientes',
  'dashboard.lowStock': 'Alertas de Stock Bajo',
  'dashboard.monthlyRevenue': 'Ingresos Mensuales',
  'dashboard.salesByCategory': 'Ventas por Categoría',
  'dashboard.thisMonth': 'Este mes',
  'dashboard.vsLastMonth': 'vs mes anterior',
  
  // Product Management
  'products.title': 'Gestión de Productos',
  'products.addNew': 'Agregar Nuevo Producto',
  'products.name': 'Nombre del Producto',
  'products.category': 'Categoría',
  'products.price': 'Precio',
  'products.comparePrice': 'Precio Comparativo',
  'products.stock': 'Stock',
  'products.status': 'Estado',
  'products.active': 'Activo',
  'products.draft': 'Borrador',
  'products.edit': 'Editar',
  'products.delete': 'Eliminar',
  'products.images': 'Imágenes',
  'products.save': 'Guardar Producto',
  'products.noProducts': 'No hay productos publicados aún.',
  
  // Blog
  'blog.categories.skincare': 'Rutina de Skincare',
  'blog.categories.ingredients': 'Guía de Ingredientes',
  'blog.categories.makeup': 'Tutoriales de Maquillaje',
  'blog.categories.wellness': 'Bienestar',
  
  // Common
  'common.loading': 'Cargando...',
  'common.error': 'Ha ocurrido un error',
  'common.save': 'Guardar',
  'common.cancel': 'Cancelar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.close': 'Cerrar',
  'common.units': 'unidades',
}

interface LanguageContextType {
  t: (key: string) => string
  language: 'es' | 'en'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const t = (key: string): string => {
    return translations[key] || key
  }

  return (
    <LanguageContext.Provider value={{ t, language: 'es' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return { t: context.t, language: context.language }
}
