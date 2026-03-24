'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type Language = 'es' | 'en'

interface Translations {
  [key: string]: {
    es: string
    en: string
  }
}

const translations: Translations = {
  // Navigation
  'nav.home': { es: 'Inicio', en: 'Home' },
  'nav.shop': { es: 'Tienda', en: 'Shop' },
  'nav.brands': { es: 'Marcas', en: 'Brands' },
  'nav.blog': { es: 'Blog', en: 'Blog' },
  'nav.about': { es: 'Nosotros', en: 'About' },
  'nav.login': { es: 'Iniciar Sesion', en: 'Login' },
  'nav.register': { es: 'Registrarse', en: 'Register' },
  'nav.seller': { es: 'Vendedor', en: 'Seller' },
  'nav.myAccount': { es: 'Mi Cuenta', en: 'My Account' },
  'nav.myOrders': { es: 'Mis Pedidos', en: 'My Orders' },
  'nav.myCoupons': { es: 'Mis Cupones', en: 'My Coupons' },
  'nav.wishlist': { es: 'Lista de Deseos', en: 'Wishlist' },
  'nav.addresses': { es: 'Direcciones', en: 'Addresses' },
  'nav.settings': { es: 'Configuracion', en: 'Settings' },
  'nav.logout': { es: 'Cerrar Sesion', en: 'Logout' },
  
  // Hero
  'hero.tagline': { es: 'Donde la belleza encuentra su esencia', en: 'Where beauty meets expertise' },
  'hero.shopNow': { es: 'Comprar Ahora', en: 'Shop Now' },
  'hero.sellWithUs': { es: 'Vende con Nosotros', en: 'Sell with Us' },
  
  // Featured Products
  'featured.title': { es: 'Nuevos Productos', en: 'New Arrivals' },
  'featured.all': { es: 'Todos', en: 'All' },
  'featured.skincare': { es: 'Skincare', en: 'Skincare' },
  'featured.makeup': { es: 'Maquillaje', en: 'Makeup' },
  'featured.addToCart': { es: 'Agregar al Carrito', en: 'Add to Cart' },
  
  // Brands
  'brands.title': { es: 'Nuestras Marcas', en: 'Our Brands' },
  'brands.viewStore': { es: 'Ver Tienda', en: 'View Store' },
  
  // Testimonials
  'testimonials.title': { es: 'Lo Que Dicen Nuestros Clientes', en: 'What Our Customers Say' },
  
  // Blog
  'blog.title': { es: 'Tips & Rituales de Belleza', en: 'Beauty Tips & Rituals' },
  'blog.readMore': { es: 'Leer Más', en: 'Read More' },
  
  // Footer
  'footer.tagline': { es: 'Tu destino de belleza premium', en: 'Your premium beauty destination' },
  'footer.shop': { es: 'Tienda', en: 'Shop' },
  'footer.sellWithUs': { es: 'Vende con Nosotros', en: 'Sell with Us' },
  'footer.faq': { es: 'Preguntas Frecuentes', en: 'FAQ' },
  'footer.contact': { es: 'Contacto', en: 'Contact' },
  'footer.privacy': { es: 'Política de Privacidad', en: 'Privacy Policy' },
  'footer.newsletter': { es: 'Suscríbete al Newsletter', en: 'Subscribe to Newsletter' },
  'footer.emailPlaceholder': { es: 'Tu correo electrónico', en: 'Your email address' },
  'footer.subscribe': { es: 'Suscribirse', en: 'Subscribe' },
  
  // Shop
  'shop.title': { es: 'Tienda', en: 'Shop' },
  'shop.search': { es: 'Buscar productos...', en: 'Search products...' },
  'shop.filters': { es: 'Filtros', en: 'Filters' },
  'shop.category': { es: 'Categoría', en: 'Category' },
  'shop.brand': { es: 'Marca', en: 'Brand' },
  'shop.priceRange': { es: 'Rango de Precio', en: 'Price Range' },
  'shop.rating': { es: 'Calificación', en: 'Rating' },
  'shop.sortBy': { es: 'Ordenar por', en: 'Sort by' },
  'shop.newest': { es: 'Más Nuevos', en: 'Newest' },
  'shop.priceLowHigh': { es: 'Precio: Menor a Mayor', en: 'Price: Low to High' },
  'shop.priceHighLow': { es: 'Precio: Mayor a Menor', en: 'Price: High to Low' },
  'shop.mostPopular': { es: 'Más Popular', en: 'Most Popular' },
  'shop.clearFilters': { es: 'Limpiar Filtros', en: 'Clear Filters' },
  
  // Product Detail
  'product.addToCart': { es: 'Agregar al Carrito', en: 'Add to Cart' },
  'product.buyNow': { es: 'Comprar Ahora', en: 'Buy Now' },
  'product.description': { es: 'Descripción', en: 'Description' },
  'product.ingredients': { es: 'Ingredientes', en: 'Ingredients' },
  'product.howToUse': { es: 'Cómo Usar', en: 'How to Use' },
  'product.inStock': { es: 'En Stock', en: 'In Stock' },
  'product.lowStock': { es: 'Pocas Unidades', en: 'Low Stock' },
  'product.outOfStock': { es: 'Agotado', en: 'Out of Stock' },
  'product.relatedProducts': { es: 'Productos Relacionados', en: 'Related Products' },
  'product.reviews': { es: 'Reseñas', en: 'Reviews' },
  
  // Cart
  'cart.title': { es: 'Tu Carrito', en: 'Your Cart' },
  'cart.empty': { es: 'Tu carrito está vacío', en: 'Your cart is empty' },
  'cart.subtotal': { es: 'Subtotal', en: 'Subtotal' },
  'cart.shipping': { es: 'Envío', en: 'Shipping' },
  'cart.total': { es: 'Total', en: 'Total' },
  'cart.checkout': { es: 'Proceder al Pago', en: 'Proceed to Checkout' },
  'cart.continueShopping': { es: 'Continuar Comprando', en: 'Continue Shopping' },
  
  // Checkout
  'checkout.title': { es: 'Finalizar Compra', en: 'Checkout' },
  'checkout.shipping': { es: 'Información de Envío', en: 'Shipping Information' },
  'checkout.payment': { es: 'Método de Pago', en: 'Payment Method' },
  'checkout.fullName': { es: 'Nombre Completo', en: 'Full Name' },
  'checkout.email': { es: 'Correo Electrónico', en: 'Email Address' },
  'checkout.phone': { es: 'Teléfono', en: 'Phone Number' },
  'checkout.address': { es: 'Dirección', en: 'Street Address' },
  'checkout.city': { es: 'Ciudad', en: 'City' },
  'checkout.state': { es: 'Estado/Provincia', en: 'State/Province' },
  'checkout.zip': { es: 'Código Postal', en: 'ZIP Code' },
  'checkout.country': { es: 'País', en: 'Country' },
  'checkout.deliveryMethod': { es: 'Método de Entrega', en: 'Delivery Method' },
  'checkout.standard': { es: 'Estándar (5-7 días)', en: 'Standard (5-7 days)' },
  'checkout.express': { es: 'Express (2-3 días)', en: 'Express (2-3 days)' },
  'checkout.creditCard': { es: 'Tarjeta de Crédito/Débito', en: 'Credit/Debit Card' },
  'checkout.paypal': { es: 'PayPal', en: 'PayPal' },
  'checkout.bankTransfer': { es: 'Transferencia Bancaria', en: 'Bank Transfer' },
  'checkout.placeOrder': { es: 'Realizar Pedido', en: 'Place Order' },
  'checkout.orderSummary': { es: 'Resumen del Pedido', en: 'Order Summary' },
  'checkout.createAccount': { es: 'Crear cuenta para seguir tu pedido', en: 'Create an account to track your order' },
  
  // Order Confirmation
  'confirmation.title': { es: '¡Pedido Confirmado!', en: 'Order Confirmed!' },
  'confirmation.message': { es: 'Gracias por tu compra. Te enviaremos un correo con los detalles.', en: 'Thank you for your purchase. We will send you an email with the details.' },
  'confirmation.orderNumber': { es: 'Número de Pedido', en: 'Order Number' },
  
  // Seller Auth
  'seller.login': { es: 'Iniciar Sesión', en: 'Login' },
  'seller.register': { es: 'Registrar Marca', en: 'Register Brand' },
  'seller.brandName': { es: 'Nombre de la Marca', en: 'Brand Name' },
  'seller.ownerName': { es: 'Nombre del Propietario', en: 'Owner Full Name' },
  'seller.email': { es: 'Correo Electrónico', en: 'Email' },
  'seller.password': { es: 'Contraseña', en: 'Password' },
  'seller.confirmPassword': { es: 'Confirmar Contraseña', en: 'Confirm Password' },
  'seller.phone': { es: 'Teléfono', en: 'Phone Number' },
  'seller.country': { es: 'País', en: 'Country' },
  'seller.terms': { es: 'Acepto los Términos y Condiciones', en: 'I accept the Terms & Conditions' },
  'seller.createAccount': { es: 'Crear Cuenta de Vendedor', en: 'Create Seller Account' },
  'seller.forgotPassword': { es: '¿Olvidaste tu contraseña?', en: 'Forgot password?' },
  'seller.alreadyHaveAccount': { es: '¿Ya tienes cuenta?', en: 'Already have an account?' },
  'seller.noAccount': { es: '¿No tienes cuenta?', en: "Don't have an account?" },
  
  // Dashboard
  'dashboard.welcome': { es: 'Bienvenido de vuelta', en: 'Welcome back' },
  'dashboard.addProduct': { es: 'Agregar Producto', en: 'Add Product' },
  'dashboard.viewStore': { es: 'Ver Tienda', en: 'View Store' },
  'dashboard.logout': { es: 'Cerrar Sesión', en: 'Logout' },
  'dashboard.totalRevenue': { es: 'Ingresos Totales', en: 'Total Revenue' },
  'dashboard.totalSales': { es: 'Ventas Totales', en: 'Total Sales' },
  'dashboard.availableStock': { es: 'Stock Disponible', en: 'Available Stock' },
  'dashboard.mostViewed': { es: 'Más Vistos', en: 'Most Viewed' },
  'dashboard.bestSelling': { es: 'Más Vendidos', en: 'Best Selling' },
  'dashboard.recentOrders': { es: 'Pedidos Recientes', en: 'Recent Orders' },
  'dashboard.lowStock': { es: 'Alertas de Stock Bajo', en: 'Low Stock Alerts' },
  'dashboard.monthlyRevenue': { es: 'Ingresos Mensuales', en: 'Monthly Revenue' },
  'dashboard.salesByCategory': { es: 'Ventas por Categoría', en: 'Sales by Category' },
  'dashboard.thisMonth': { es: 'Este mes', en: 'This month' },
  'dashboard.vsLastMonth': { es: 'vs mes anterior', en: 'vs last month' },
  
  // Product Management
  'products.title': { es: 'Gestión de Productos', en: 'Product Management' },
  'products.addNew': { es: 'Agregar Nuevo Producto', en: 'Add New Product' },
  'products.name': { es: 'Nombre del Producto', en: 'Product Name' },
  'products.category': { es: 'Categoría', en: 'Category' },
  'products.price': { es: 'Precio', en: 'Price' },
  'products.comparePrice': { es: 'Precio Comparativo', en: 'Compare at Price' },
  'products.stock': { es: 'Stock', en: 'Stock' },
  'products.status': { es: 'Estado', en: 'Status' },
  'products.active': { es: 'Activo', en: 'Active' },
  'products.draft': { es: 'Borrador', en: 'Draft' },
  'products.edit': { es: 'Editar', en: 'Edit' },
  'products.delete': { es: 'Eliminar', en: 'Delete' },
  'products.images': { es: 'Imágenes', en: 'Images' },
  'products.save': { es: 'Guardar Producto', en: 'Save Product' },
  
  // Blog
  'blog.categories.skincare': { es: 'Rutina de Skincare', en: 'Skincare Routine' },
  'blog.categories.ingredients': { es: 'Guía de Ingredientes', en: 'Ingredient Guide' },
  'blog.categories.makeup': { es: 'Tutoriales de Maquillaje', en: 'Makeup Tutorials' },
  'blog.categories.wellness': { es: 'Bienestar', en: 'Wellness' },
  
  // Common
  'common.loading': { es: 'Cargando...', en: 'Loading...' },
  'common.error': { es: 'Ha ocurrido un error', en: 'An error occurred' },
  'common.save': { es: 'Guardar', en: 'Save' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel' },
  'common.delete': { es: 'Eliminar', en: 'Delete' },
  'common.edit': { es: 'Editar', en: 'Edit' },
  'common.close': { es: 'Cerrar', en: 'Close' },
  'common.units': { es: 'unidades', en: 'units' },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es')
  
  const t = useCallback((key: string): string => {
    const translation = translations[key]
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`)
      return key
    }
    return translation[language]
  }, [language])
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
