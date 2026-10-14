import L from "leaflet"

// Leaflet's default marker images don't resolve correctly through Vite's
// bundler, so every marker here uses a hand-built DivIcon instead — also
// lets us match the app's brand colors instead of Leaflet's stock pin.

export function labelIcon(label: string, bg: string) {
  return L.divIcon({
    html: `<div style="background:${bg};color:#fff;width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid #fff;font-family:inherit;">${label}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

export function dotIcon(color: string, size = 16) {
  return L.divIcon({
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:9999px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

export const pickupIcon = labelIcon("A", "#5B4FE8")
export const dropoffIcon = labelIcon("B", "#7C3AED")
export const riderIcon = dotIcon("#5B4FE8")
export const riderWaitingIcon = dotIcon("#10B981", 18)
export const riderBusyIcon = dotIcon("#F59E0B", 18)
