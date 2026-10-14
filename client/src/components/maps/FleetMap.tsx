import { useState } from "react"
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api"
import { useMaps } from "@/contexts/MapsContext"
import MapFallback from "./MapFallback"
import type { OnlineRider } from "@/types"

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
}

const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 }

export default function FleetMap({ riders, height = 480 }: { riders: OnlineRider[]; height?: number }) {
  const { isLoaded, hasKey } = useMaps()
  const [active, setActive] = useState<OnlineRider | null>(null)

  if (!hasKey) {
    return <MapFallback height={height} message="Fleet map" />
  }

  if (!isLoaded) {
    return <MapFallback height={height} message="Loading live map…" />
  }

  const center = riders[0] ? { lat: riders[0].lat, lng: riders[0].lng } : DEFAULT_CENTER

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height, borderRadius: "1rem" }}
      center={center}
      zoom={riders.length ? 12 : 11}
      options={mapOptions}
    >
      {riders.map((r) => (
        <Marker
          key={r.user_id}
          position={{ lat: r.lat, lng: r.lng }}
          onClick={() => setActive(r)}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: r.active_order_id ? "#F59E0B" : "#10B981",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          }}
        />
      ))}

      {active && (
        <InfoWindow position={{ lat: active.lat, lng: active.lng }} onCloseClick={() => setActive(null)}>
          <div className="text-sm">
            <p className="font-semibold">{active.full_name}</p>
            <p className="capitalize text-muted-foreground">{active.vehicle_type} · ★ {active.rating.toFixed(1)}</p>
            <p className="text-muted-foreground">
              {active.active_order_id ? `On delivery #${active.active_order_id}` : "Waiting for requests"}
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}
