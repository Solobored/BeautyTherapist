import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Protección de Datos Personales',
  description: 'Todo sobre cómo Beauty & Therapy trata tus datos personales, conforme a la Ley 21.719.',
}

const links = [
  { href: '/politicas/privacidad', label: 'Política de Privacidad' },
  { href: '/politicas/cookies', label: 'Política de Cookies' },
  { href: '/politicas/derechos-arco', label: 'Ejercicio de derechos ARCO+' },
  { href: '/politicas/compra-venta', label: 'Políticas de compra y venta' },
  { href: '/politicas/devoluciones', label: 'Cambios, devoluciones y garantía' },
]

export default function DataProtectionIndexPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <h1 className="font-serif text-3xl mb-6">Protección de Datos Personales</h1>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-accent underline hover:text-accent/80">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
