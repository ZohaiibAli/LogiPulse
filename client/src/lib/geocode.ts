const GEOCODE_TIMEOUT_MS = 5000

export function reverseGeocode(lat: number, lng: number): Promise<string> {
  const fallback = `Current location (${lat.toFixed(4)}, ${lng.toFixed(4)})`

  const geocodePromise = new Promise<string>((resolve) => {
    if (typeof google === "undefined" || !google.maps?.Geocoder) {
      resolve(fallback)
      return
    }

    try {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          resolve(results[0].formatted_address)
        } else {
          resolve(fallback)
        }
      })
    } catch {
      // An invalid/misconfigured API key can make the Geocoder throw synchronously
      // or never invoke its callback at all — either way, fall back gracefully.
      resolve(fallback)
    }
  })

  const timeoutPromise = new Promise<string>((resolve) => {
    setTimeout(() => resolve(fallback), GEOCODE_TIMEOUT_MS)
  })

  return Promise.race([geocodePromise, timeoutPromise])
}
