import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { searchAddress, type GeocodeResult } from "@/lib/nominatim"
import { cn } from "@/lib/utils"

interface Props {
  placeholder: string
  value: string
  onChange: (address: string) => void
  onPlaceSelected: (address: string, lat: number, lng: number) => void
  icon?: React.ReactNode
}

// Nominatim's usage policy asks for ~1 request/second max, hence the debounce.
const DEBOUNCE_MS = 450

export default function AddressAutocomplete({ placeholder, value, onChange, onPlaceSelected, icon }: Props) {
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const justSelectedRef = useRef(false)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    abortRef.current?.abort()

    if (!value.trim() || value.trim().length < 3) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const matches = await searchAddress(value, controller.signal)
        setResults(matches)
        setOpen(true)
      } catch {
        // aborted or network hiccup — just leave the list as-is
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const select = (result: GeocodeResult) => {
    justSelectedRef.current = true
    setOpen(false)
    setResults([])
    onPlaceSelected(result.display_name, result.lat, result.lng)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className={icon ? "pl-10" : undefined}
          autoComplete="off"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border bg-popover shadow-lg">
          {results.map((r, i) => (
            <button
              key={`${r.lat}-${r.lng}-${i}`}
              type="button"
              onClick={() => select(r)}
              className={cn(
                "block w-full truncate px-3 py-2 text-left text-sm hover:bg-secondary",
                i !== results.length - 1 && "border-b"
              )}
              title={r.display_name}
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
