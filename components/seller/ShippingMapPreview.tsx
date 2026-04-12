/**
 * Componente que renderiza un mapa con todos los puntos de envío del vendedor
 */
'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type ShippingLocation = {
  orderId: string
  lat: number
  lng: number
  buyerName: string
  city: string
}

interface ShippingMapPreviewProps {
  locations: ShippingLocation[]
}

// Fix Leaflet default icon issue
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

export function ShippingMapPreview({ locations }: ShippingMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || !locations.length) return

    // Inicializar mapa
    const map = L.map(mapRef.current).setView([-33.4489, -70.6693], 11)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Agregar marcadores
    const bounds = L.latLngBounds([])
    locations.forEach((location, idx) => {
      const marker = L.marker([location.lat, location.lng]).addTo(map)
      marker.bindPopup(
        `<div class="text-sm"><strong>${location.buyerName}</strong><br/>${location.city}<br/><small>${location.orderId.slice(0, 8)}…</small></div>`
      )

      const latlng = L.latLng(location.lat, location.lng)
      bounds.extend(latlng)

      // Cambiar color del marcador cada 3 pedidos
      const colors = ['red', 'blue', 'green', 'purple', 'orange', 'darkred', 'darkblue', 'darkgreen']
      const color = colors[idx % colors.length]
      
      marker.setIcon(
        L.icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-${color}.png`,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      )
    })

    // Ajustar vista a todos los marcadores
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [locations])

  return (
    <div
      ref={mapRef}
      className="h-80 rounded-lg border border-border overflow-hidden"
      style={{ background: '#f5f5f5' }}
    />
  )
}
