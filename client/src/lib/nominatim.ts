// OpenStreetMap's free Nominatim geocoder — no API key, no billing account.
// Usage policy (https://operations.osmfoundation.org/policies/nominatim/) asks
// for max ~1 request/second, which the debounce in AddressAutocomplete respects.

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org"

export interface GeocodeResult {
  display_name: string
  lat: number
  lng: number
}

export async function searchAddress(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  if (!query.trim()) return []

  const url = `${NOMINATIM_BASE}/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=0`
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } })
  if (!res.ok) return []

  const data: Array<{ display_name: string; lat: string; lon: string }> = await res.json()
  return data.map((d) => ({
    display_name: d.display_name,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }))
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const fallback = `Current location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
  try {
    const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    const res = await fetch(url, { headers: { Accept: "application/json" } })
    if (!res.ok) return fallback
    const data = await res.json()
    return data?.display_name || fallback
  } catch {
    return fallback
  }
}
