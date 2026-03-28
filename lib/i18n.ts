// Internationalization (i18n) configuration
// Contains all UI strings in Spanish (ES) and English (EN)

export type Language = 'es' | 'en';

export const translations = {
  common: {
    appName: { es: 'Beauty & Therapy', en: 'Beauty & Therapy' },
    loading: { es: 'Cargando...', en: 'Loading...' },
    usingLocalData: { es: 'Usando datos locales temporalmente', en: 'Using local data temporarily' },
    error: { es: 'Error', en: 'Error' },
    success: { es: 'Éxito', en: 'Success' },
    warning: { es: 'Advertencia', en: 'Warning' },
    confirm: { es: 'Confirmar', en: 'Confirm' },
    cancel: { es: 'Cancelar', en: 'Cancel' },
    save: { es: 'Guardar', en: 'Save' },
    delete: { es: 'Eliminar', en: 'Delete' },
    edit: { es: 'Editar', en: 'Edit' },
    add: { es: 'Agregar', en: 'Add' },
    close: { es: 'Cerrar', en: 'Close' },
    search: { es: 'Buscar', en: 'Search' },
    filter: { es: 'Filtrar', en: 'Filter' },
    sort: { es: 'Ordenar', en: 'Sort' },
    apply: { es: 'Aplicar', en: 'Apply' },
    reset: { es: 'Reiniciar', en: 'Reset' },
  },

  navigation: {
    home: { es: 'Inicio', en: 'Home' },
    shop: { es: 'Tienda', en: 'Shop' },
    brands: { es: 'Marcas', en: 'Brands' },
    blog: { es: 'Blog', en: 'Blog' },
    cart: { es: 'Carrito', en: 'Cart' },
    account: { es: 'Cuenta', en: 'Account' },
    dashboard: { es: 'Panel', en: 'Dashboard' },
    logout: { es: 'Cerrar Sesión', en: 'Logout' },
    login: { es: 'Iniciar Sesión', en: 'Login' },
    register: { es: 'Registrarse', en: 'Register' },
    sellDashboard: { es: 'Panel de Vendedor', en: 'Seller Dashboard' },
  },

  auth: {
    welcomeBack: { es: '¡Bienvenido de vuelta!', en: 'Welcome back!' },
    signInEmail: { es: 'Correo electrónico', en: 'Email' },
    signInPassword: { es: 'Contraseña', en: 'Password' },
    signInButton: { es: 'Iniciar Sesión', en: 'Sign In' },
    signUpButton: { es: 'Registrarse', en: 'Sign Up' },
    fullName: { es: 'Nombre Completo', en: 'Full Name' },
    selectRole: { es: 'Seleccionar Rol', en: 'Select Role' },
    buyerRole: { es: 'Comprador', en: 'Buyer' },
    sellerRole: { es: 'Vendedor', en: 'Seller' },
    alreadyHaveAccount: { es: '¿Ya tienes cuenta?', en: 'Already have an account?' },
    dontHaveAccount: { es: '¿No tienes cuenta?', en: 'Don\'t have an account?' },
    rememberMe: { es: 'Recuérdame', en: 'Remember me' },
    forgotPassword: { es: '¿Olvidaste tu contraseña?', en: 'Forgot password?' },
    invalidEmail: { es: 'Correo electrónico inválido', en: 'Invalid email' },
    passwordTooShort: { es: 'Contraseña muy corta (mín. 8 caracteres)', en: 'Password too short (min. 8 characters)' },
    passwordMismatch: { es: 'Las contraseñas no coinciden', en: 'Passwords don\'t match' },
    loginSuccess: { es: 'Sesión iniciada correctamente', en: 'Login successful' },
    registerSuccess: { es: 'Registro exitoso', en: 'Registration successful' },
    loginError: { es: 'Credenciales inválidas', en: 'Invalid credentials' },
  },

  products: {
    allProducts: { es: 'Todos los Productos', en: 'All Products' },
    noProducts: { es: 'No hay productos disponibles', en: 'No products available' },
    featured: { es: 'Destacados', en: 'Featured' },
    newArrivals: { es: 'Nuevos Lanzamientos', en: 'New Arrivals' },
    category: { es: 'Categoría', en: 'Category' },
    skincare: { es: 'Cuidado de la Piel', en: 'Skincare' },
    makeup: { es: 'Maquillaje', en: 'Makeup' },
    price: { es: 'Precio', en: 'Price' },
    priceFrom: { es: 'Precio Desde', en: 'Price From' },
    priceTo: { es: 'Precio Hasta', en: 'Price To' },
    inStock: { es: 'En Stock', en: 'In Stock' },
    outOfStock: { es: 'Agotado', en: 'Out of Stock' },
    quantity: { es: 'Cantidad', en: 'Quantity' },
    addToCart: { es: 'Agregar al Carrito', en: 'Add to Cart' },
    addToWishlist: { es: 'Agregar a Favoritos', en: 'Add to Wishlist' },
    description: { es: 'Descripción', en: 'Description' },
    ingredients: { es: 'Ingredientes', en: 'Ingredients' },
    howToUse: { es: 'Cómo Usar', en: 'How to Use' },
    reviews: { es: 'Reseñas', en: 'Reviews' },
    rating: { es: 'Calificación', en: 'Rating' },
    viewDetails: { es: 'Ver Detalles', en: 'View Details' },
    relatedProducts: { es: 'Productos Relacionados', en: 'Related Products' },
    productAdded: { es: 'Producto agregado al carrito', en: 'Product added to cart' },
    productRemoved: { es: 'Producto removido del carrito', en: 'Product removed from cart' },
  },

  cart: {
    shoppingCart: { es: 'Carrito de Compras', en: 'Shopping Cart' },
    cartEmpty: { es: 'Tu carrito está vacío', en: 'Your cart is empty' },
    items: { es: 'Artículos', en: 'Items' },
    subtotal: { es: 'Subtotal', en: 'Subtotal' },
    shipping: { es: 'Envío', en: 'Shipping' },
    discount: { es: 'Descuento', en: 'Discount' },
    total: { es: 'Total', en: 'Total' },
    continueShopping: { es: 'Continuar Comprando', en: 'Continue Shopping' },
    checkout: { es: 'Proceder al Pago', en: 'Checkout' },
    applyCoupon: { es: 'Aplicar Cupón', en: 'Apply Coupon' },
    couponCode: { es: 'Código de Cupón', en: 'Coupon Code' },
    couponApplied: { es: 'Cupón aplicado', en: 'Coupon applied' },
    invalidCoupon: { es: 'Cupón inválido o expirado', en: 'Invalid or expired coupon' },
    removeCoupon: { es: 'Remover Cupón', en: 'Remove Coupon' },
  },

  checkout: {
    checkoutProcess: { es: 'Proceso de Compra', en: 'Checkout Process' },
    shippingInfo: { es: 'Información de Envío', en: 'Shipping Information' },
    billingAddress: { es: 'Dirección de Facturación', en: 'Billing Address' },
    fullName: { es: 'Nombre Completo', en: 'Full Name' },
    email: { es: 'Correo Electrónico', en: 'Email' },
    phone: { es: 'Teléfono', en: 'Phone' },
    street: { es: 'Calle', en: 'Street' },
    city: { es: 'Ciudad', en: 'City' },
    state: { es: 'Estado/Provincia', en: 'State/Province' },
    zipCode: { es: 'Código Postal', en: 'ZIP Code' },
    country: { es: 'País', en: 'Country' },
    paymentMethod: { es: 'Método de Pago', en: 'Payment Method' },
    creditCard: { es: 'Tarjeta de Crédito', en: 'Credit Card' },
    cardNumber: { es: 'Número de Tarjeta', en: 'Card Number' },
    expiryDate: { es: 'Fecha de Vencimiento', en: 'Expiry Date' },
    cvv: { es: 'CVV', en: 'CVV' },
    processPayment: { es: 'Procesar Pago', en: 'Process Payment' },
    processingPayment: { es: 'Procesando pago...', en: 'Processing payment...' },
    paymentSuccess: { es: 'Pago exitoso', en: 'Payment successful' },
    paymentFailed: { es: 'Pago rechazado', en: 'Payment failed' },
    cardDeclined: { es: 'Tu tarjeta fue rechazada', en: 'Your card was declined' },
    cardExpired: { es: 'Tu tarjeta ha expirado', en: 'Your card has expired' },
    orderSummary: { es: 'Resumen del Pedido', en: 'Order Summary' },
    reviewOrder: { es: 'Revisar Pedido', en: 'Review Order' },
  },

  orders: {
    orders: { es: 'Pedidos', en: 'Orders' },
    orderNumber: { es: 'Número de Pedido', en: 'Order Number' },
    orderDate: { es: 'Fecha del Pedido', en: 'Order Date' },
    orderStatus: { es: 'Estado del Pedido', en: 'Order Status' },
    pending: { es: 'Pendiente', en: 'Pending' },
    processing: { es: 'Procesando', en: 'Processing' },
    shipped: { es: 'Enviado', en: 'Shipped' },
    delivered: { es: 'Entregado', en: 'Delivered' },
    cancelled: { es: 'Cancelado', en: 'Cancelled' },
    trackingNumber: { es: 'Número de Seguimiento', en: 'Tracking Number' },
    estimatedDelivery: { es: 'Entrega Estimada', en: 'Estimated Delivery' },
    orderConfirmation: { es: 'Confirmación del Pedido', en: 'Order Confirmation' },
    thankyou: { es: '¡Gracias por tu compra!', en: 'Thank you for your purchase!' },
    viewOrder: { es: 'Ver Pedido', en: 'View Order' },
    cancelOrder: { es: 'Cancelar Pedido', en: 'Cancel Order' },
  },

  account: {
    myAccount: { es: 'Mi Cuenta', en: 'My Account' },
    dashboard: { es: 'Panel de Control', en: 'Dashboard' },
    profile: { es: 'Perfil', en: 'Profile' },
    addresses: { es: 'Direcciones', en: 'Addresses' },
    wishlist: { es: 'Lista de Deseos', en: 'Wishlist' },
    orderHistory: { es: 'Historial de Pedidos', en: 'Order History' },
    settings: { es: 'Configuración', en: 'Settings' },
    preferences: { es: 'Preferencias', en: 'Preferences' },
    notifications: { es: 'Notificaciones', en: 'Notifications' },
    editProfile: { es: 'Editar Perfil', en: 'Edit Profile' },
    changePassword: { es: 'Cambiar Contraseña', en: 'Change Password' },
    addAddress: { es: 'Agregar Dirección', en: 'Add Address' },
    editAddress: { es: 'Editar Dirección', en: 'Edit Address' },
    deleteAddress: { es: 'Eliminar Dirección', en: 'Delete Address' },
    setDefault: { es: 'Establecer como Predeterminada', en: 'Set as Default' },
  },

  seller: {
    sellerDashboard: { es: 'Panel de Vendedor', en: 'Seller Dashboard' },
    products: { es: 'Productos', en: 'Products' },
    addProduct: { es: 'Agregar Producto', en: 'Add Product' },
    editProduct: { es: 'Editar Producto', en: 'Edit Product' },
    deleteProduct: { es: 'Eliminar Producto', en: 'Delete Product' },
    productName: { es: 'Nombre del Producto', en: 'Product Name' },
    productNameEs: { es: 'Nombre del Producto (ES)', en: 'Product Name (ES)' },
    productNameEn: { es: 'Nombre del Producto (EN)', en: 'Product Name (EN)' },
    price: { es: 'Precio', en: 'Price' },
    compareAtPrice: { es: 'Precio Anterior', en: 'Compare At Price' },
    stock: { es: 'Stock', en: 'Stock' },
    category: { es: 'Categoría', en: 'Category' },
    status: { es: 'Estado', en: 'Status' },
    active: { es: 'Activo', en: 'Active' },
    inactive: { es: 'Inactivo', en: 'Inactive' },
    draft: { es: 'Borrador', en: 'Draft' },
    images: { es: 'Imágenes', en: 'Images' },
    uploadImages: { es: 'Cargar Imágenes', en: 'Upload Images' },
    sales: { es: 'Ventas', en: 'Sales' },
    revenue: { es: 'Ingresos', en: 'Revenue' },
    averageOrderValue: { es: 'Valor Promedio del Pedido', en: 'Average Order Value' },
    metrics: { es: 'Métricas', en: 'Metrics' },
    analytics: { es: 'Análisis', en: 'Analytics' },
    orders: { es: 'Pedidos', en: 'Orders' },
    updateInventory: { es: 'Actualizar Inventario', en: 'Update Inventory' },
  },

  blog: {
    blog: { es: 'Blog', en: 'Blog' },
    latestArticles: { es: 'Últimos Artículos', en: 'Latest Articles' },
    article: { es: 'Artículo', en: 'Article' },
    readMore: { es: 'Leer Más', en: 'Read More' },
    author: { es: 'Autor', en: 'Author' },
    published: { es: 'Publicado', en: 'Published' },
    category: { es: 'Categoría', en: 'Category' },
    skincareTips: { es: 'Consejos de Cuidado de la Piel', en: 'Skincare Tips' },
    makeupTutorials: { es: 'Tutoriales de Maquillaje', en: 'Makeup Tutorials' },
    wellness: { es: 'Bienestar', en: 'Wellness' },
    trending: { es: 'Tendencias', en: 'Trending' },
  },

  footer: {
    aboutUs: { es: 'Acerca de Nosotros', en: 'About Us' },
    contact: { es: 'Contacto', en: 'Contact' },
    faq: { es: 'Preguntas Frecuentes', en: 'FAQ' },
    shippingInfo: { es: 'Información de Envío', en: 'Shipping Info' },
    returns: { es: 'Devoluciones', en: 'Returns' },
    privacyPolicy: { es: 'Política de Privacidad', en: 'Privacy Policy' },
    termsOfService: { es: 'Términos de Servicio', en: 'Terms of Service' },
    followUs: { es: 'Síguenos', en: 'Follow Us' },
    subscribe: { es: 'Suscribirse', en: 'Subscribe' },
    enterEmail: { es: 'Ingresa tu correo electrónico', en: 'Enter your email' },
    copyright: {
      es: '© 2024 Beauty & Therapy. Todos los derechos reservados.',
      en: '© 2024 Beauty & Therapy. All rights reserved.',
    },
  },

  errors: {
    pageNotFound: { es: 'Página No Encontrada', en: 'Page Not Found' },
    notFoundMessage: { es: 'La página que buscas no existe.', en: 'The page you\'re looking for doesn\'t exist.' },
    serverError: { es: 'Error del Servidor', en: 'Server Error' },
    serverErrorMessage: { es: 'Algo salió mal. Por favor, intenta de nuevo.', en: 'Something went wrong. Please try again.' },
    noResults: { es: 'Sin Resultados', en: 'No Results' },
    noResultsMessage: { es: 'No encontramos lo que buscas.', en: 'We couldn\'t find what you\'re looking for.' },
    tryAgain: { es: 'Intentar de Nuevo', en: 'Try Again' },
    goHome: { es: 'Ir a Inicio', en: 'Go Home' },
  },
};

// Helper function to get translated text
export function t(key: string, lang: Language): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    value = value?.[k];
  }

  if (typeof value === 'object' && value !== null) {
    return value[lang] || value['en'] || key;
  }

  return value || key;
}

// Helper to get all keys for a section
export function getKeys(section: keyof typeof translations): string[] {
  return Object.keys(translations[section]);
}
