export interface Brand {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  banner: string
  facebook?: string
  instagram?: string
  tiktok?: string
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

export interface Testimonial {
  id: string
  customerName: string
  customerImage: string
  rating: number
  text: string
  textEs?: string
}

export const brands: Brand[] = [
  {
    id: '1',
    name: 'AngeBae',
    slug: 'angebae',
    description: 'Skincare y maquillaje premium elaborados con amor. Nuestros productos combinan ingredientes naturales con fórmulas innovadoras para revelar tu belleza natural.',
    logo: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop',
    facebook: 'https://www.facebook.com/angebae',
    instagram: 'https://www.instagram.com/angebae',
    tiktok: 'https://www.tiktok.com/@angebae'
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
