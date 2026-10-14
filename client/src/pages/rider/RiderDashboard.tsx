import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Loader2, MapPin, Navigation, ShieldAlert, LocateFixed, Wallet, PackageCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useRiderProfile, useToggleOnline, useAvailableOrders, useAcceptOrder, useMyOrders,
  useUpdateRiderLocation,
} from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api"
import { bucketByDay } from "@/lib/chartData"
import Sparkline from "@/components/charts/Sparkline"
import VehicleTrendChart from "@/components/charts/VehicleTrendChart"
import RiderHero from "@/components/rider/RiderHero"

// Visual tiering for the "nearest first" distance badge/bar — purely cosmetic,
// the actual sort order always comes from the server's haversine calculation.
const MAX_BAR_KM = 10
function distanceTier(km: number) {
  if (km <= 2) return { bar: "bg-emerald-500", text: "text-emerald-600", chip: "bg-emerald-100 text-emerald-700" }
  if (km <= 5) return { bar: "bg-amber-500", text: "text-amber-600", chip: "bg-amber-100 text-amber-700" }
  return { bar: "bg-rose-500", text: "text-rose-600", chip: "bg-rose-100 text-rose-700" }
}

export default function RiderDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: profile, isLoading: profileLoading } = useRiderProfile()
  const toggleOnline = useToggleOnline()
  const { data: available, isLoading: availableLoading } = useAvailableOrders()
  const { data: myOrders } = useMyOrders()
  const acceptOrder = useAcceptOrder()
  const updateLocation = useUpdateRiderLocation()
  const [locationError, setLocationError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)

  const activeOrder = myOrders?.find((o) => !["delivered", "cancelled"].includes(o.status))

  const deliveredThisWeek = myOrders?.filter((o) => {
    if (o.status !== "delivered" || !o.delivered_at) return false
    return Date.now() - new Date(o.delivered_at).getTime() < 7 * 24 * 60 * 60 * 1000
  }) ?? []
  const earningsThisWeek = deliveredThisWeek.reduce((sum, o) => sum + o.price, 0)
  const earningsByDay = myOrders
    ? bucketByDay(myOrders, 7, (o) => (o.status === "delivered" ? o.delivered_at : null), (o) => o.price)
    : []
  const earningsSparkline = earningsByDay.map((d) => d.value)

  // While online (and not already inside an active delivery, which tracks separately),
  // keep the rider's last-known position fresh so the admin fleet map stays live.
  useEffect(() => {
    const shouldTrack = profile?.is_online && !activeOrder
    if (!shouldTrack || !("geolocation" in navigator)) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocationError(null)
        updateLocation.mutate({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => setLocationError("Couldn't access your location. Enable location access to receive nearby requests."),
      { enableHighAccuracy: true, maximumAge: 10000 }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.is_online, !!activeOrder])

  if (profileLoading) return <Skeleton className="h-40 rounded-2xl" />

  if (profile?.status !== "approved") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-amber-500" />
        <h2 className="text-lg font-bold text-amber-900">
          {profile?.status === "rejected" ? "Application not approved" : "Approval pending"}
        </h2>
        <p className="mt-2 text-sm text-amber-700">
          {profile?.status === "rejected"
            ? "Your rider application was rejected. Contact support for details."
            : "An admin needs to verify your details before you can start accepting deliveries. Check back soon."}
        </p>
      </div>
    )
  }

  const handleAccept = async (orderId: number) => {
    try {
      await acceptOrder.mutateAsync(orderId)
      toast.success("Order accepted!")
      navigate(`/rider/orders/${orderId}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6">
      <RiderHero
        name={user?.full_name.split(" ")[0]}
        online={!!profile?.is_online}
        onToggle={(checked) => toggleOnline.mutate(checked)}
        toggling={toggleOnline.isPending}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-extrabold">{formatCurrency(earningsThisWeek)}</p>
              <p className="text-xs text-muted-foreground">Earned this week</p>
            </div>
          </div>
          {earningsSparkline.length > 1 && <Sparkline values={earningsSparkline} />}
        </div>
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <PackageCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-extrabold">{deliveredThisWeek.length}</p>
            <p className="text-xs text-muted-foreground">Delivered this week</p>
          </div>
        </div>
      </motion.div>

      {earningsByDay.some((d) => d.value > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="rounded-2xl border bg-card p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">Earnings — last 7 days</h2>
          </div>
          <VehicleTrendChart data={earningsByDay} vehicle="bike" valuePrefix="Rs " height={160} />
        </motion.div>
      )}

      {profile?.is_online && locationError && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700"
        >
          <MapPin className="h-4 w-4 shrink-0" />
          {locationError}
        </motion.div>
      )}

      {activeOrder && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Active delivery</p>
              <p className="text-lg font-bold">Order #{activeOrder.id} · {formatCurrency(activeOrder.price)}</p>
            </div>
            <Button onClick={() => navigate(`/rider/orders/${activeOrder.id}`)} className="rounded-full bg-brand-gradient">
              Open delivery
            </Button>
          </div>
        </motion.div>
      )}

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Available requests</h2>
          {profile?.is_online && available && available.length > 0 && (
            available[0].distance_from_rider_km != null ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <LocateFixed className="h-3 w-3" /> Sorted nearest first
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                <MapPin className="h-3 w-3" /> Enable location for nearby sorting
              </span>
            )
          )}
        </div>

        {!profile?.is_online ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Go online to see nearby delivery requests.
          </div>
        ) : availableLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : available && available.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
            {available.map((o, i) => {
              const nearbyKm = o.distance_from_rider_km ?? null
              const tier = nearbyKm !== null ? { km: nearbyKm, ...distanceTier(nearbyKm) } : null
              return (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">Order #{o.id}</span>
                      {tier && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tier.chip}`}>
                          {tier.km.toFixed(1)} km away
                        </span>
                      )}
                    </div>
                    {tier && (
                      <div className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${tier.bar}`}
                          style={{ width: `${Math.min(100, (tier.km / MAX_BAR_KM) * 100)}%` }}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="line-clamp-1">{o.pickup_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="h-3.5 w-3.5 text-violet-500" />
                      <span className="line-clamp-1">{o.dropoff_address}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(o.created_at)}</span>
                      <span>{o.distance_km} km trip</span>
                      <span className="capitalize">{o.package_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold text-indigo-700">{formatCurrency(o.price)}</span>
                    <Button
                      onClick={() => handleAccept(o.id)}
                      disabled={acceptOrder.isPending || !!activeOrder}
                      className="rounded-full bg-brand-gradient"
                    >
                      {acceptOrder.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                      Accept
                    </Button>
                  </div>
                </motion.div>
              )
            })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No requests right now — check back shortly.
          </div>
        )}
      </div>
    </div>
  )
}
