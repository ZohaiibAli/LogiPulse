import { useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, MapPin, Navigation, Package, Phone, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import RouteMap from "@/components/maps/RouteMap"
import StatusTimeline from "@/components/orders/StatusTimeline"
import ChatPanel from "@/components/chat/ChatPanel"
import { useOrder, useUpdateOrderStatus } from "@/hooks/useApi"
import { useOrderConversation } from "@/hooks/useOrderConversation"
import { formatCurrency, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api"
import type { OrderStatus } from "@/types"

const NEXT_STATUS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  accepted: { next: "picked_up", label: "Mark picked up" },
  picked_up: { next: "in_transit", label: "Start delivering" },
  in_transit: { next: "delivered", label: "Mark delivered" },
}

export default function RiderOrderDetail() {
  const { id } = useParams()
  const orderId = Number(id)
  const { data: order, isLoading } = useOrder(orderId)
  const updateStatus = useUpdateOrderStatus()
  const { messages, sendChat, sendLocation, connected, riderPosition, liveStatus } = useOrderConversation(order)
  const watchIdRef = useRef<number | null>(null)

  const liveOrderStatus = liveStatus || order?.status

  useEffect(() => {
    const trackable = liveOrderStatus && ["accepted", "picked_up", "in_transit"].includes(liveOrderStatus)
    if (!trackable || !navigator.geolocation) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [liveOrderStatus, sendLocation])

  if (isLoading || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    )
  }

  const action = NEXT_STATUS[order.status]

  const handleAdvance = async () => {
    if (!action) return
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: action.next })
      toast.success(`Status updated: ${ORDER_STATUS_LABEL[action.next]}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-5xl space-y-6"
    >
      <Link to="/rider/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to history
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Order #{order.id}</h1>
          <p className="text-sm text-muted-foreground">{formatCurrency(order.price)} · {order.distance_km} km</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("border px-3 py-1 text-sm", ORDER_STATUS_COLOR[order.status])}>
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
          {action && (
            <Button onClick={handleAdvance} disabled={updateStatus.isPending} className="rounded-full bg-brand-gradient">
              {updateStatus.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {action.label}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <RouteMap
            pickup={{ lat: order.pickup_lat, lng: order.pickup_lng }}
            dropoff={{ lat: order.dropoff_lat, lng: order.dropoff_lng }}
            riderPosition={riderPosition}
            height={320}
          />
          <ChatPanel order={order} messages={messages} sendChat={sendChat} connected={connected} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-4 text-sm font-bold">Delivery status</h3>
            <StatusTimeline history={order.status_history} currentStatus={order.status} />
          </div>

          <div className="space-y-3 rounded-2xl border bg-card p-5 text-sm">
            <h3 className="mb-1 text-sm font-bold">Package & receiver</h3>
            <div className="flex items-start gap-2">
              <Package className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{order.package_type}{order.package_weight ? ` · ${order.package_weight}kg` : ""}</span>
            </div>
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{order.receiver_name}</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{order.receiver_phone}</span>
            </div>
            {order.dropoff_details && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>{order.dropoff_details}</span>
              </div>
            )}
            {order.notes && (
              <div className="flex items-start gap-2">
                <Navigation className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>{order.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
