import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import MapFallback from "./MapFallback"
import { riderWaitingIcon, riderBusyIcon } from "@/lib/leafletIcons"
import type { OnlineRider } from "@/types"

const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 }

function FitToRiders({ riders }: { riders: OnlineRider[] }) {
  const map = useMap()
  useEffect(() => {
    if (riders.length === 0) return
    if (riders.length === 1) {
      map.setView([riders[0].lat, riders[0].lng], 13, { animate: true })
      return
    }
    map.fitBounds(L.latLngBounds(riders.map((r) => [r.lat, r.lng])), { padding: [50, 50], maxZoom: 14 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riders.map((r) => `${r.user_id}:${r.lat}:${r.lng}`).join(",")])
  return null
}

export default function FleetMap({ riders, height = 480 }: { riders: OnlineRider[]; height?: number }) {
  if (riders.length === 0) {
    return <MapFallback height={height} message="No riders online right now" />
  }

  return (
    <div style={{ height, borderRadius: "1rem", overflow: "hidden" }}>
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {riders.map((r) => (
          <Marker
            key={r.user_id}
            position={[r.lat, r.lng]}
            icon={r.active_order_id ? riderBusyIcon : riderWaitingIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{r.full_name}</p>
                <p className="capitalize text-muted-foreground">{r.vehicle_type} · ★ {r.rating.toFixed(1)}</p>
                <p className="text-muted-foreground">
                  {r.active_order_id ? `On delivery #${r.active_order_id}` : "Waiting for requests"}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        <FitToRiders riders={riders} />
      </MapContainer>
    </div>
  )
}
