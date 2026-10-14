import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import MapFallback from "./MapFallback"
import { pickupIcon, dropoffIcon, riderIcon } from "@/lib/leafletIcons"
import { fetchRoute } from "@/lib/osrm"

interface Point {
  lat: number
  lng: number
}

interface Props {
  pickup?: Point
  dropoff?: Point
  riderPosition?: Point | null
  className?: string
  height?: number
}

const DEFAULT_CENTER: Point = { lat: 24.8607, lng: 67.0011 }

// Live rider tracking takes priority (pan to follow); otherwise fit the
// viewport to show both pickup and drop-off so the whole trip stays visible.
function AutoFit({ pickup, dropoff, riderPosition }: { pickup?: Point; dropoff?: Point; riderPosition?: Point | null }) {
  const map = useMap()
  useEffect(() => {
    if (riderPosition) {
      map.setView([riderPosition.lat, riderPosition.lng], Math.max(map.getZoom(), 14), { animate: true })
      return
    }
    if (pickup && dropoff) {
      map.fitBounds(
        L.latLngBounds([pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]),
        { padding: [40, 40], maxZoom: 15 }
      )
      return
    }
    const single = pickup || dropoff
    if (single) map.setView([single.lat, single.lng], 13, { animate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng, riderPosition?.lat, riderPosition?.lng])
  return null
}

export default function RouteMap({ pickup, dropoff, riderPosition, className, height = 320 }: Props) {
  const [route, setRoute] = useState<[number, number][] | null>(null)

  useEffect(() => {
    if (!pickup || !dropoff) {
      setRoute(null)
      return
    }
    let cancelled = false
    fetchRoute(pickup, dropoff).then((coords) => {
      if (!cancelled) setRoute(coords || [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]])
    })
    return () => {
      cancelled = true
    }
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng])

  if (!pickup && !dropoff) {
    return <MapFallback className={className} height={height} message="Set a pickup or drop-off to see the map" />
  }

  const center = pickup || dropoff || DEFAULT_CENTER

  return (
    <div className={className} style={{ height, borderRadius: "1rem", overflow: "hidden" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon} />}
        {riderPosition && <Marker position={[riderPosition.lat, riderPosition.lng]} icon={riderIcon} />}
        {route && <Polyline positions={route} pathOptions={{ color: "#5B4FE8", weight: 4 }} />}
        <AutoFit pickup={pickup} dropoff={dropoff} riderPosition={riderPosition} />
      </MapContainer>
    </div>
  )
}
