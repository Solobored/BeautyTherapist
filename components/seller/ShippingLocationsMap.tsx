/**
 * Componente para mostrar una vista previa de geolocalización en el dashboard de vendedores
 */
'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'

type ShippingLocation = {
  orderId: string
  lat: number
  lng: number
  buyerName: string
  city: string
}

interface ShippingMapProps {
  locations: ShippingLocation[]
}

const DynamicMap = dynamic(() => import('./ShippingMapPreview').then(m => m.ShippingMapPreview), {
  ssr: false,
  loading: () => (
    <div className="h-80 rounded-lg border border-border bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Cargando mapa de envíos...</p>
    </div>
  ),
})

export function ShippingLocationsMap({ locations }: ShippingMapProps) {
  const hasLocations = useMemo(() => locations.length > 0, [locations])

  if (!hasLocations) {
    return (
      <div className="h-80 rounded-lg border border-border bg-muted flex items-center justify-center text-center">
        <div className="text-muted-foreground">
          <p className="font-medium">Sin geolocalización</p>
          <p className="text-sm">Los pedidos sin coordenadas no se mostrarán en el mapa.</p>
        </div>
      </div>
    )
  }

  return <DynamicMap locations={locations} />
}
