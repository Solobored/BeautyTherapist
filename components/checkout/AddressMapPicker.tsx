'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const iconProto = L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string }
delete iconProto._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapClickLayer({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export type MapPinValue = { lat: number; lng: number }

export function AddressMapPicker({
  value,
  onChange,
  center = [-33.4489, -70.6693] as [number, number],
}: {
  value: MapPinValue | null
  onChange: (v: MapPinValue | null) => void
  center?: [number, number]
}) {
  const mapCenter: [number, number] = value ? [value.lat, value.lng] : center

  return (
    <div className="h-[240px] w-full rounded-xl overflow-hidden border border-border [&_.leaflet-container]:z-0">
      <MapContainer
        center={mapCenter}
        zoom={value ? 15 : 11}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickLayer onPick={(lat, lng) => onChange({ lat, lng })} />
        {value != null && <Marker position={[value.lat, value.lng]} />}
      </MapContainer>
    </div>
  )
}
