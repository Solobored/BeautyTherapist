import {
  LayoutDashboard, LineChart, Wallet, Receipt, Package, ClipboardList, FileText, Tags, Star, Sparkles,
  Clapperboard, Ticket, Store, Truck, type LucideIcon,
} from 'lucide-react'

export type SectionId =
  | 'resumen' | 'ventas' | 'finanzas' | 'costos'
  | 'categorias' | 'destacados' | 'videos'
  | 'cupones' | 'resenas'
  | 'mi-marca' | 'envios'

export type NavItem = {
  id?: SectionId
  /** Si existe, es un enlace a otra página en vez de una sección interna. */
  href?: string
  label: string
  icon: LucideIcon
}

export type NavGroup = { label: string; items: NavItem[] }

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Negocio',
    items: [
      { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
      { id: 'ventas', label: 'Ventas', icon: LineChart },
      { id: 'finanzas', label: 'Finanzas', icon: Wallet },
      { id: 'costos', label: 'Costos', icon: Receipt },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/seller/products', label: 'Productos', icon: Package },
      { href: '/seller/orders', label: 'Pedidos', icon: ClipboardList },
      { id: 'categorias', label: 'Categorías', icon: Tags },
      { id: 'destacados', label: 'Destacados', icon: Sparkles },
      { id: 'videos', label: 'Videos', icon: Clapperboard },
      { href: '/seller/blog', label: 'Blog', icon: FileText },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { id: 'cupones', label: 'Cupones', icon: Ticket },
      { id: 'resenas', label: 'Reseñas', icon: Star },
    ],
  },
  {
    label: 'Tienda',
    items: [
      { id: 'mi-marca', label: 'Mi marca', icon: Store },
      { id: 'envios', label: 'Envíos', icon: Truck },
    ],
  },
]

export const PRIMARY_MOBILE: SectionId[] = ['resumen', 'ventas', 'finanzas', 'costos']

export const SECTION_TITLES: Record<SectionId, { title: string; subtitle: string }> = {
  resumen: { title: 'Resumen', subtitle: 'El pulso de tu negocio de un vistazo' },
  ventas: { title: 'Ventas', subtitle: 'Pedidos, productos y clientes' },
  finanzas: { title: 'Finanzas', subtitle: 'Ingresos, costos y utilidad real' },
  costos: { title: 'Costos', subtitle: 'Costo de producto y comisiones' },
  categorias: { title: 'Categorías', subtitle: 'Organiza tu catálogo' },
  destacados: { title: 'Productos destacados', subtitle: 'Aparecen primero en tu página pública' },
  videos: { title: 'Videos', subtitle: 'Contenido corto para tu marca' },
  cupones: { title: 'Cupones', subtitle: 'Descuentos y envíos gratis' },
  resenas: { title: 'Reseñas', subtitle: 'Experiencias de tus clientes' },
  'mi-marca': { title: 'Mi marca', subtitle: 'Perfil público, cuenta y pagos' },
  envios: { title: 'Envíos', subtitle: 'Métodos y zonas de entrega' },
}

/** Secciones que dependen del selector de periodo. */
export const PERIOD_SECTIONS: SectionId[] = ['resumen', 'ventas', 'finanzas', 'costos']
export const isSectionId = (v: string | null): v is SectionId => !!v && v in SECTION_TITLES
