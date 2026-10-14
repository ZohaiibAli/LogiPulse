import { useState } from "react"

export interface Coords {
  lat: number
  lng: number
}

export function useCurrentLocation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getLocation = (): Promise<Coords> => {
    setError(null)

    if (!("geolocation" in navigator)) {
      const message = "Geolocation isn't supported by this browser."
      setError(message)
      return Promise.reject(new Error(message))
    }

    setLoading(true)
    return new Promise<Coords>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoading(false)
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        (err) => {
          setLoading(false)
          const message =
            err.code === err.PERMISSION_DENIED
              ? "Location access was denied. Enable it in your browser settings."
              : "Couldn't get your location. Please try again."
          setError(message)
          reject(new Error(message))
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }

  return { getLocation, loading, error }
}
