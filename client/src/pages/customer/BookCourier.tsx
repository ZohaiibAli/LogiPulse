import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { MapPin, Package, Loader2, Navigation, LocateFixed } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AddressAutocomplete from "@/components/maps/AddressAutocomplete"
import RouteMap from "@/components/maps/RouteMap"
import { useCreateOrder, useEstimate } from "@/hooks/useApi"
import { useCurrentLocation } from "@/hooks/useCurrentLocation"
import { reverseGeocode } from "@/lib/nominatim"
import { formatCurrency } from "@/lib/utils"
import { getErrorMessage as apiError } from "@/lib/api"

interface Point {
  address: string
  lat?: number
  lng?: number
}

export default function BookCourier() {
  const navigate = useNavigate()
  const createOrder = useCreateOrder()
  const estimate = useEstimate()
  const { getLocation, loading: locating } = useCurrentLocation()

  const [pickup, setPickup] = useState<Point>({ address: "" })
  const [pickupDetails, setPickupDetails] = useState("")
  const [dropoff, setDropoff] = useState<Point>({ address: "" })
  const [dropoffDetails, setDropoffDetails] = useState("")
  const [receiverName, setReceiverName] = useState("")
  const [receiverPhone, setReceiverPhone] = useState("")
  const [packageType, setPackageType] = useState("parcel")
  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")

  const ready = pickup.lat && pickup.lng && dropoff.lat && dropoff.lng

  useEffect(() => {
    if (pickup.lat && pickup.lng && dropoff.lat && dropoff.lng) {
      estimate.mutate({
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup.lat, pickup.lng, dropoff.lat, dropoff.lng])

  const handleUseCurrentLocation = async () => {
    try {
      const { lat, lng } = await getLocation()
      const address = await reverseGeocode(lat, lng)
      setPickup({ address, lat, lng })
      toast.success("Pickup set to your current location")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't get your location")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready) {
      toast.error("Pick a pickup and drop-off location from the suggestions")
      return
    }
    if (!receiverName || !receiverPhone) {
      toast.error("Add the receiver's name and phone number")
      return
    }
    try {
      const order = await createOrder.mutateAsync({
        pickup_address: pickup.address,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        pickup_details: pickupDetails || undefined,
        dropoff_address: dropoff.address,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
        dropoff_details: dropoffDetails || undefined,
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        package_type: packageType,
        package_weight: weight ? Number(weight) : undefined,
        notes: notes || undefined,
      })
      toast.success("Order placed — finding you a rider!")
      navigate(`/app/orders/${order.id}`)
    } catch (error) {
      toast.error(apiError(error))
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold">Book a courier</h1>
      <p className="mb-6 text-sm text-muted-foreground">Set your pickup & drop-off, and we'll find you a rider.</p>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-2xl border bg-card p-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Pickup location</Label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <LocateFixed className="h-3 w-3" />}
                  Use current location
                </button>
              </div>
              <AddressAutocomplete
                placeholder="Where should the rider collect it?"
                value={pickup.address}
                icon={<MapPin className="h-4 w-4" />}
                onChange={(address) => setPickup((p) => ({ ...p, address }))}
                onPlaceSelected={(address, lat, lng) => setPickup({ address, lat, lng })}
              />
              <Input
                value={pickupDetails}
                onChange={(e) => setPickupDetails(e.target.value)}
                placeholder="Flat/floor/block (optional) — e.g. Flat 3B, 2nd Floor, Block C"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Drop-off location</Label>
              <AddressAutocomplete
                placeholder="Where is it going?"
                value={dropoff.address}
                icon={<Navigation className="h-4 w-4" />}
                onChange={(address) => setDropoff((p) => ({ ...p, address }))}
                onPlaceSelected={(address, lat, lng) => setDropoff({ address, lat, lng })}
              />
              <Input
                value={dropoffDetails}
                onChange={(e) => setDropoffDetails(e.target.value)}
                placeholder="Receiver's flat/floor/block (optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Receiver name</Label>
              <Input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Ali Khan" />
            </div>
            <div className="space-y-1.5">
              <Label>Receiver phone</Label>
              <Input value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} placeholder="03xx-xxxxxxx" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Package type</Label>
              <Select value={packageType} onValueChange={setPackageType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="parcel">Parcel</SelectItem>
                  <SelectItem value="fragile">Fragile</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Weight, kg (optional)</Label>
              <Input type="number" min="0" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="1.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes for the rider (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Handle with care, call on arrival, etc." />
          </div>

          <Button type="submit" className="h-12 w-full rounded-full bg-brand-gradient text-base" disabled={createOrder.isPending}>
            {createOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm booking {estimate.data && `· ${formatCurrency(estimate.data.price)}`}
          </Button>
        </div>

        <div className="space-y-4">
          <RouteMap
            pickup={pickup.lat && pickup.lng ? { lat: pickup.lat, lng: pickup.lng } : undefined}
            dropoff={dropoff.lat && dropoff.lng ? { lat: dropoff.lat, lng: dropoff.lng } : undefined}
            height={280}
          />

          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Package className="h-4 w-4 text-primary" /> Fare estimate
            </div>
            {estimate.isPending ? (
              <p className="text-sm text-muted-foreground">Calculating…</p>
            ) : estimate.data ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Distance</span><span>{estimate.data.distance_km} km</span></div>
                <div className="flex justify-between text-base font-bold"><span>Estimated price</span><span>{formatCurrency(estimate.data.price)}</span></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Pick both locations to see your fare.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
