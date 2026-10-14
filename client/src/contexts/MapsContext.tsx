import { createContext, useContext, type ReactNode } from "react"
import { useJsApiLoader } from "@react-google-maps/api"

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"]

interface MapsContextType {
  isLoaded: boolean
  loadError: Error | undefined
  hasKey: boolean
}

const MapsContext = createContext<MapsContextType>({
  isLoaded: false,
  loadError: undefined,
  hasKey: false,
})

export function MapsProvider({ children }: { children: ReactNode }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const hasKey = Boolean(apiKey)

  const { isLoaded, loadError } = useJsApiLoader({
    id: "swiftship-google-maps",
    googleMapsApiKey: apiKey || "missing-key",
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  return (
    <MapsContext.Provider value={{ isLoaded: hasKey && isLoaded, loadError, hasKey }}>
      {children}
    </MapsContext.Provider>
  )
}

export function useMaps() {
  return useContext(MapsContext)
}
