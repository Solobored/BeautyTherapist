import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Explora skincare, maquillaje y productos premium seleccionados por expertos.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Tienda',
    description: 'Explora skincare, maquillaje y productos premium seleccionados por expertos.',
    type: 'website',
    url: '/shop',
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
