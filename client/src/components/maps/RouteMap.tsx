import { useEffect, useState } from "react"
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api"
import { useMaps } from "@/contexts/MapsContext"
import MapFallback from "./MapFallback"

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

const containerStyleBase = { width: "100%", borderRadius: "1rem" }

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  ],
}

export default function RouteMap({ pickup, dropoff, riderPosition, className, height = 320 }: Props) {
  const { isLoaded, hasKey } = useMaps()
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

  useEffect(() => {
    if (!isLoaded || !pickup || !dropoff) {
      setDirections(null)
      return
    }
    const service = new google.maps.DirectionsService()
    service.route(
      {
        origin: pickup,
        destination: dropoff,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) setDirections(result)
        else setDirections(null)
      }
    )
  }, [isLoaded, pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng])

  if (!hasKey) {
    return <MapFallback className={className} height={height} />
  }

  if (!isLoaded) {
    return <MapFallback className={className} height={height} message="Loading live map…" />
  }

  const center = pickup || dropoff || { lat: 24.8607, lng: 67.0011 }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={{ ...containerStyleBase, height }}
        center={riderPosition || center}
        zoom={13}
        options={mapOptions}
      >
      {pickup && <Marker position={pickup} label={{ text: "A", color: "white" }} />}
      {dropoff && <Marker position={dropoff} label={{ text: "B", color: "white" }} />}
      {riderPosition && (
        <Marker
          position={riderPosition}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#5B4FE8",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          }}
        />
      )}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: { strokeColor: "#5B4FE8", strokeWeight: 4 },
          }}
        />
      )}
      </GoogleMap>
    </div>
  )
}
