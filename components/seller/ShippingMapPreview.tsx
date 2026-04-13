/**
 * Componente que renderiza un mapa con todos los puntos de envío del vendedor
 */
'use client'

import { useEffect, useRef, useState } from 'react'
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

// Create colored SVG icons for markers
const createColoredIcon = (color: string) => {
  const colors: Record<string, string> = {
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#22c55e',
    'purple': '#a855f7',
    'orange': '#f97316',
    'darkred': '#991b1b',
    'darkblue': '#1e40af',
    'darkgreen': '#15803d'
  }

  const svgColor = colors[color] || colors['blue']
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40" width="30" height="40"><path fill="${svgColor}" stroke="white" stroke-width="1.5" d="M15 1C8.4 1 3 6.4 3 13c0 10 12 26 12 26s12-16 12-26c0-6.6-5.4-12-12-12zm0 17c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/></svg>`
  
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  
  return L.icon({
    iconUrl: url,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  })
}

export function ShippingMapPreview({ locations }: ShippingMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    // Ejecutar solo en cliente
    if (typeof window === 'undefined') return
    if (!mapRef.current) return
    if (!locations || locations.length === 0) return
    
    // Si el mapa ya existe, limpiarlo primero
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    try {
      // Inicializar mapa
      const map = L.map(mapRef.current, { 
        preferCanvas: false 
      }).setView([-33.4489, -70.6693], 11)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Agregar marcadores
      const bounds = L.latLngBounds([])
      const colors = ['red', 'blue', 'green', 'purple', 'orange', 'darkred', 'darkblue', 'darkgreen']
      
      locations.forEach((location, idx) => {
        try {
          // Validar coordenadas
          if (!location.lat || !location.lng) return
          
          const latlng = L.latLng(location.lat, location.lng)
          const marker = L.marker(latlng, {
            icon: createColoredIcon(colors[idx % colors.length])
          }).addTo(map)
          
          marker.bindPopup(
            `<div style="font-size: 12px; line-height: 1.5;"><strong>${location.buyerName}</strong><br/>${location.city}<br/><small style="color: #666;">${location.orderId.slice(0, 8)}...</small></div>`,
            { maxWidth: 200 }
          )

          bounds.extend(latlng)
        } catch (e) {
          console.warn('Error adding marker for location:', location, e)
        }
      })

      // Ajustar vista a todos los marcadores
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }

      mapInstanceRef.current = map
      setMapReady(true)
    } catch (error) {
      console.error('Error initializing map:', error)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      setMapReady(false)
    }
  }, [locations])

  return (
    <div
      ref={mapRef}
      className="h-80 rounded-lg border border-border overflow-hidden"
      style={{ background: '#f5f5f5', minHeight: '320px' }}
    />
  )
}
