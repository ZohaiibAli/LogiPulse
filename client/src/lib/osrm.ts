// Free public OSRM demo routing server — no API key. Used only to draw a
// road-following line on the map; it never feeds pricing (that's haversine,
// computed server-side) so an outage here only affects the visual route.
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving"

export async function fetchRoute(
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number }
): Promise<[number, number][] | null> {
  try {
    const url = `${OSRM_BASE}/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const coords: [number, number][] | undefined = data?.routes?.[0]?.geometry?.coordinates
    if (!coords) return null
    // GeoJSON is [lng, lat]; Leaflet wants [lat, lng].
    return coords.map(([lng, lat]) => [lat, lng])
  } catch {
    return null
  }
}
