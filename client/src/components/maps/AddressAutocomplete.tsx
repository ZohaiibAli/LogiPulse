import { useRef } from "react"
import { Autocomplete } from "@react-google-maps/api"
import { Input } from "@/components/ui/input"
import { useMaps } from "@/contexts/MapsContext"

interface Props {
  placeholder: string
  value: string
  onChange: (address: string) => void
  onPlaceSelected: (address: string, lat: number, lng: number) => void
  icon?: React.ReactNode
}

export default function AddressAutocomplete({ placeholder, value, onChange, onPlaceSelected, icon }: Props) {
  const { isLoaded } = useMaps()
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()
    const location = place?.geometry?.location
    if (location) {
      onPlaceSelected(place.formatted_address || place.name || value, location.lat(), location.lng())
    }
  }

  const input = (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={icon ? "pl-10" : undefined}
      />
    </div>
  )

  if (!isLoaded) return input

  return (
    <Autocomplete
      onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
      onPlaceChanged={handlePlaceChanged}
    >
      {input}
    </Autocomplete>
  )
}
