export interface Product {
  id: string
  name: string
  brand: string
  brandSlug: string
  category: 'skincare' | 'makeup'
  price: number
  comparePrice?: number
  description: string
  ingredients: string
  howToUse: string
  images: string[]
  rating: number
  reviewCount: number
  stock: number
  status: 'active' | 'draft' | 'inactive'
}

export interface Brand {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  banner: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  category: 'skincare' | 'ingredients' | 'makeup' | 'wellness'
  author: string
  authorImage: string
  date: string
}

export interface Review {
  id: string
  productId: string
  customerName: string
  customerImage: string
  rating: number
  text: string
  textEs: string
  date: string
}

export interface Order {
  id: string
  customerName: string
  product: string
  quantity: number
  total: number
  status: 'pending' | 'shipped' | 'delivered'
  date: string
}

export interface Testimonial {
  id: string
  customerName: string
  customerImage: string
  rating: number
  text: string
  textEs: string
}

export const brands: Brand[] = [
  {
    id: '1',
    name: 'AngeBae',
    slug: 'angebae',
    description: 'Skincare y maquillaje premium elaborados con amor. Nuestros productos combinan ingredientes naturales con fórmulas innovadoras para revelar tu belleza natural.',
    logo: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop'
  }
]

export const products: Product[] = [
  {
    id: 'e1abd814-c1ec-44ce-abc8-4f89eed2aaa5',
    name: 'Sérum Resplandor Radiante',
    brand: 'AngeBae',
    brandSlug: 'angebae',
    category: 'skincare',
    price: 68,
    comparePrice: 85,
    description: 'Un lujoso sérum de vitamina C que ilumina y unifica el tono de la piel mientras proporciona una poderosa protección antioxidante. Formulado con 15% de vitamina C estabilizada y ácido hialurónico para una tez luminosa e hidratada.',
    ingredients: 'Aqua, Ascorbic Acid, Sodium Hyaluronate, Ferulic Acid, Vitamin E, Aloe Vera Extract, Glycerin, Niacinamide',
    howToUse: 'Aplica 3-4 gotas sobre la piel limpia y seca por la mañana y por la noche. Continúa con hidratante y protector solar durante el día.',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=600&fit=crop'
    ],
    rating: 4.8,
    reviewCount: 156,
    stock: 45,
    status: 'active'
  },
  {
    id: 'a2bcd914-d2ed-55df-bbd9-5e9affe3bbb6',
    name: 'Hidratante Rosa de Terciopelo',
    brand: 'AngeBae',
    brandSlug: 'angebae',
    category: 'skincare',
    price: 54,
    description: 'Una crema ultra-rica infusionada con aceite de rosa mosqueta y péptidos para una hidratación profunda y beneficios anti-edad. Perfecta para pieles secas y maduras.',
    ingredients: 'Rosa Canina Fruit Oil, Peptide Complex, Shea Butter, Jojoba Oil, Ceramides, Vitamin E, Rose Water',
    howToUse: 'Masajea suavemente en el rostro y cuello después de la limpieza y el sérum. Usa por la mañana y por la noche.',
    images: [
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&h=600&fit=crop'
    ],
    rating: 4.9,
    reviewCount: 203,
    stock: 32,
    status: 'active'
  },
  {
    id: 'b3cde025-e3fe-66ef-cce0-6f0bfff4ccc7',
    name: 'Base de Seda SPF 30',
    brand: 'AngeBae',
    brandSlug: 'angebae',
    category: 'makeup',
    price: 42,
    description: 'Una base ligera y modulable con acabado natural y protección solar. Infusionada con ingredientes de skincare para nutrir mientras la usas.',
    ingredients: 'Zinc Oxide, Titanium Dioxide, Hyaluronic Acid, Vitamin E, Silica, Iron Oxides',
    howToUse: 'Aplica con brocha, esponja o las yemas de los dedos. Construye la cobertura según desees. Reaplica protector solar durante el día.',
    images: [
      'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop'
    ],
    rating: 4.7,
    reviewCount: 89,
    stock: 67,
    status: 'active'
  },
  {
    id: 'c4deff36-f4af-77af-ddf1-7a1caffa5ddd8',
    name: 'Crema de Ojos Recuperación Nocturna',
    brand: 'AngeBae',
    brandSlug: 'angebae',
    category: 'skincare',
    price: 48,
    description: 'Un tratamiento intensivo para ojos que trabaja durante la noche para reducir ojeras, hinchazón y líneas finas. Formulado con cafeína y retinol.',
    ingredients: 'Caffeine, Retinol, Peptides, Hyaluronic Acid, Cucumber Extract, Green Tea Extract, Vitamin K',
    howToUse: 'Da pequeños toques con una pequeña cantidad alrededor del área de los ojos antes de dormir. Evita el contacto directo con los ojos.',
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop'
    ],
    rating: 4.6,
    reviewCount: 124,
    stock: 28,
    status: 'active'
  },
  {
    id: 'd5efaa47-a5a8-88a8-eea2-8a2daaa6eee9',
    name: 'Tinte de Labios Pétalo Suave',
    brand: 'AngeBae',
    brandSlug: 'angebae',
    category: 'makeup',
    price: 24,
    comparePrice: 32,
    description: 'Un tinte labial hidratante que proporciona un color de aspecto natural con acabado húmedo. Enriquecido con rosa mosqueta y vitamina E.',
    ingredients: 'Castor Oil, Rosa Canina Oil, Vitamin E, Beeswax, Natural Pigments, Jojoba Oil',
    howToUse: 'Aplica directamente en los labios. Superpone para más intensidad o difumina con la yema del dedo para un toque sutil de color.',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600&h=600&fit=crop'
    ],
    rating: 4.5,
    reviewCount: 187,
    stock: 89,
    status: 'active'
  },
  {
    id: 'e6faab58-b6b9-96b9-abc3-9b3eccc7ccc0',
    name: 'Bruma Facial Hidra-Relleno',
    brand: 'AngeBae',
    brandSlug: 'angebae',
    category: 'skincare',
    price: 28,
    description: 'Una bruma facial refrescante que hidrata instantáneamente y revive la piel cansada. Perfecta para fijar el maquillaje o refrescar durante el día.',
    ingredients: 'Rose Water, Aloe Vera, Glycerin, Hyaluronic Acid, Green Tea Extract, Chamomile',
    howToUse: 'Rocía sobre el rostro cuando la piel necesite un impulso. Usa antes o después del maquillaje.',
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop'
    ],
    rating: 4.4,
    reviewCount: 98,
    stock: 3,
    status: 'active'
  },
  {
    id: 'f7accc69-c7ca-a0aa-bdd4-0c4fddd8ddd1',
    name: 'Máscara de Pestañas Lujosa',
    brand: 'AngeBae',
    brandSlug: 'angebae',
    category: 'makeup',
    price: 32,
    description: 'Una máscara de pestañas que alarga y da volumen con fórmula modulable. Crea pestañas dramáticas sin grumos ni descamación.',
    ingredients: 'Beeswax, Carnauba Wax, Iron Oxides, Vitamin E, Biotin, Castor Oil',
    howToUse: 'Mueve el aplicador desde la raíz hasta la punta. Construye capas para más volumen. Deja secar entre capas.',
    images: [
      'https://images.unsplash.com/photo-1631214540553-ff044a3ff1ea?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop'
    ],
    rating: 4.7,
    reviewCount: 234,
    stock: 56,
    status: 'active'
  },
  {
    id: 'e8bddc7a-d8db-1b1b-cee5-1d5deee8eee2',
    name: 'Limpiador en Espuma Suave',
    brand: 'AngeBae',
    brandSlug: 'angebae',
    category: 'skincare',
    price: 34,
    description: 'Un limpiador en espuma con pH equilibrado que elimina el maquillaje y las impurezas sin resecar la piel. Apto para todo tipo de pieles.',
    ingredients: 'Coconut-derived Surfactants, Aloe Vera, Chamomile Extract, Green Tea, Glycerin, Panthenol',
    howToUse: 'Bombea la espuma en las manos y masajea sobre la piel húmeda. Enjuaga completamente con agua.',
    images: [
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=600&h=600&fit=crop'
    ],
    rating: 4.8,
    reviewCount: 167,
    stock: 41,
    status: 'active'
  }
]

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'rutina-skincare-matutina-piel-radiante',
    title: 'La Rutina de Skincare Matutina Perfecta para una Piel Radiante',
    excerpt: 'Descubre los pasos esenciales para una rutina matutina que dejará tu piel radiante y protegida todo el día.',
    content: 'Comenzar tu día con la rutina de skincare correcta establece las bases para una piel saludable y radiante...',
    coverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=500&fit=crop',
    category: 'skincare',
    author: 'Dra. Sofia Martinez',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    date: '2024-01-15'
  },
  {
    id: '2',
    slug: 'entendiendo-niacinamida-beneficios',
    title: 'Entendiendo la Niacinamida: El Héroe Multitarea del Skincare',
    excerpt: 'Aprende por qué la niacinamida se ha convertido en uno de los ingredientes más queridos en las formulaciones de skincare modernas.',
    content: 'La niacinamida, también conocida como vitamina B3, ha revolucionado el mundo del skincare...',
    coverImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&h=500&fit=crop',
    category: 'ingredients',
    author: 'Maria Chen',
    authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    date: '2024-01-10'
  },
  {
    id: '3',
    slug: 'maquillaje-natural-sin-maquillaje',
    title: 'Cómo Lograr el Look de Maquillaje Natural "Sin Maquillaje"',
    excerpt: 'Domina el arte de realzar tu belleza natural con una aplicación de maquillaje mínima y estratégica.',
    content: 'El look de maquillaje "sin maquillaje" se trata de realzar tus rasgos naturales...',
    coverImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=500&fit=crop',
    category: 'makeup',
    author: 'Emma Williams',
    authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    date: '2024-01-05'
  }
]

export const testimonials: Testimonial[] = [
  {
    id: '1',
    customerName: 'Isabella García',
    customerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    text: '¡El Sérum Resplandor Radiante transformó mi piel! Después de solo dos semanas, mi cutis se ve más brillante y uniforme. ¡Absolutamente enamorada!'
  },
  {
    id: '2',
    customerName: 'Sarah Mitchell',
    customerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    text: '¡Por fin encontré una base que se siente como skincare! La Base de Seda me da el acabado más natural mientras protege mi piel del sol.'
  },
  {
    id: '3',
    customerName: 'Carmen Rodriguez',
    customerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Los productos de AngeBae son increíbles. La calidad es excepcional y se nota que usan ingredientes premium. ¡Mi piel nunca se ha visto mejor!'
  }
]

export const reviews: Review[] = [
  {
    id: '1',
    productId: 'e1abd814-c1ec-44ce-abc8-4f89eed2aaa5',
    customerName: 'Laura P.',
    customerImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    rating: 5,
    text: '¡Este sérum es increíble! Mi piel se siente tan suave y se ve mucho más brillante.',
    date: '2024-01-20'
  },
  {
    id: '2',
    productId: 'e1abd814-c1ec-44ce-abc8-4f89eed2aaa5',
    customerName: 'Jennifer M.',
    customerImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
    rating: 4,
    text: 'Gran producto, se absorbe rápidamente. Me encantaría ver una opción de tamaño más grande.',
    date: '2024-01-18'
  },
  {
    id: '3',
    productId: 'a2bcd914-d2ed-55df-bbd9-5e9affe3bbb6',
    customerName: 'Maria V.',
    customerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    text: 'La crema hidratante es tan lujosa y mi piel se siente increíblemente hidratada. ¡Definitivamente volvería a comprar!',
    date: '2024-01-19'
  },
  {
    id: '4',
    productId: 'b3cde025-e3fe-66ef-cce0-6f0bfff4ccc7',
    customerName: 'Sofia T.',
    customerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    text: '¡Esta base es perfecta! Excelente cobertura y se siente ligera en la piel.',
    date: '2024-01-17'
  },
  {
    id: '5',
    productId: 'c4deff36-f4af-77af-ddf1-7a1caffa5ddd8',
    customerName: 'Amanda R.',
    customerImage: 'https://images.unsplash.com/photo-1501196354995-01a51842bbb8?w=100&h=100&fit=crop',
    rating: 4,
    text: 'La crema de ojos funciona maravillosamente. Noto menos hinchazón por las mañanas. ¡Muy recomendado!',
    date: '2024-01-16'
  },
  {
    id: '6',
    productId: 'd5efaa47-a5a8-88a8-eea2-8a2daaa6eee9',
    customerName: 'Natalia G.',
    customerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    text: '¡Color hermoso y se mantiene todo el día! Me encanta la fórmula.',
    date: '2024-01-15'
  },
  {
    id: '7',
    productId: 'e6faab58-b6b9-96b9-abc3-9b3eccc7ccc0',
    customerName: 'Carmen H.',
    customerImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    rating: 4,
    text: 'Bruma refrescante que realmente funciona. Perfecta para fijar el maquillaje o retoques.',
    date: '2024-01-14'
  },
  {
    id: '8',
    productId: 'f7accc69-c7ca-a0aa-bdd4-0c4fddd8ddd1',
    customerName: 'Lucia S.',
    customerImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    rating: 5,
    text: '¡El mejor rímel que he usado! La fórmula es increíble y las pestañas se ven fantásticas.',
    date: '2024-01-13'
  },
  {
    id: '9',
    productId: 'e8bddc7a-d8db-1b1b-cee5-1d5deee8eee2',
    customerName: 'Rosa M.',
    customerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 4,
    text: 'Suave y delicado, elimina todo el maquillaje sin resecar mi piel. ¡Me encanta!',
    date: '2024-01-12'
  }
]

export const mockOrders: Order[] = [
  { id: 'ORD-001', customerName: 'Maria Santos', product: 'Sérum Resplandor Radiante', quantity: 2, total: 136, status: 'delivered', date: '2024-01-20' },
  { id: 'ORD-002', customerName: 'Ana López', product: 'Hidratante Rosa de Terciopelo', quantity: 1, total: 54, status: 'shipped', date: '2024-01-19' },
  { id: 'ORD-003', customerName: 'Carlos Ruiz', product: 'Base de Seda SPF 30', quantity: 1, total: 42, status: 'pending', date: '2024-01-18' },
  { id: 'ORD-004', customerName: 'Elena Torres', product: 'Crema de Ojos Recuperación Nocturna', quantity: 3, total: 144, status: 'delivered', date: '2024-01-17' },
  { id: 'ORD-005', customerName: 'Patricia Moreno', product: 'Tinte de Labios Pétalo Suave', quantity: 2, total: 48, status: 'shipped', date: '2024-01-16' },
]

export const dashboardMetrics = {
  totalRevenue: 12450,
  totalRevenueLastMonth: 10200,
  totalSales: 234,
  totalSalesLastMonth: 198,
  availableStock: 361,
  mostViewedProducts: [
    { name: 'Sérum Resplandor Radiante', views: 1250 },
    { name: 'Hidratante Rosa de Terciopelo', views: 980 },
    { name: 'Base de Seda SPF 30', views: 756 }
  ],
  bestSellingProducts: [
    { name: 'Máscara de Pestañas Lujosa', sold: 89 },
    { name: 'Sérum Resplandor Radiante', sold: 72 },
    { name: 'Tinte de Labios Pétalo Suave', sold: 65 }
  ],
  monthlyRevenue: [
    { month: 'Aug', revenue: 8500 },
    { month: 'Sep', revenue: 9200 },
    { month: 'Oct', revenue: 10100 },
    { month: 'Nov', revenue: 10200 },
    { month: 'Dec', revenue: 11800 },
    { month: 'Jan', revenue: 12450 }
  ],
  salesByCategory: [
    { category: 'Skincare', sales: 145 },
    { category: 'Makeup', sales: 89 }
  ]
}
