import { useParams, Link } from "react-router-dom"
import { ArrowLeft, MapPin, Package, Phone, User, Wallet, Loader2, X, Zap } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import RouteMap from "@/components/maps/RouteMap"
import StatusTimeline from "@/components/orders/StatusTimeline"
import ChatPanel from "@/components/chat/ChatPanel"
import { useOrder, useCancelOrder } from "@/hooks/useApi"
import { useOrderConversation } from "@/hooks/useOrderConversation"
import { useAuth } from "@/contexts/AuthContext"
import { formatCurrency, formatDate, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, cn } from "@/lib/utils"
import { PRIORITY_LABEL, PRIORITY_COLOR } from "@/lib/priority"
import { getErrorMessage } from "@/lib/api"

export default function OrderDetail() {
  const { id } = useParams()
  const orderId = Number(id)
  const { user } = useAuth()
  const backTo = user?.role === "admin" ? "/admin/orders" : "/app/orders"
  const { data: order, isLoading } = useOrder(orderId)
  const cancelOrder = useCancelOrder()
  const { messages, sendChat, connected, riderPosition } = useOrderConversation(order)

  if (isLoading || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    )
  }

  const canCancel = user?.role !== "admin" && (order.status === "pending" || order.status === "accepted")

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync(order.id)
      toast.success("Order cancelled")
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Order #{order.id}</h1>
          <p className="text-sm text-muted-foreground">Placed {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("border px-3 py-1 text-sm", ORDER_STATUS_COLOR[order.status])}>
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
          <Badge variant="outline" className={cn("gap-1 border px-3 py-1 text-sm", PRIORITY_COLOR[order.priority])}>
            {order.priority !== "normal" && <Zap className="h-3.5 w-3.5" />}
            {PRIORITY_LABEL[order.priority]}
          </Badge>
          {canCancel && (
            <Button variant="outline" size="sm" className="rounded-full" onClick={handleCancel} disabled={cancelOrder.isPending}>
              {cancelOrder.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <X className="mr-1.5 h-3.5 w-3.5" />}
              Cancel
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

          {order.rider && <ChatPanel order={order} messages={messages} sendChat={sendChat} connected={connected} />}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-4 text-sm font-bold">Delivery status</h3>
            <StatusTimeline history={order.status_history} currentStatus={order.status} />
          </div>

          <div className="space-y-4 rounded-2xl border bg-card p-5">
            <h3 className="text-sm font-bold">Details</h3>
            <div className="space-y-3 text-sm">
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
              <div className="flex items-start gap-2">
                <Wallet className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{order.payment_method} · {formatCurrency(order.price)}</span>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>{PRIORITY_LABEL[order.priority]} priority fee · {formatCurrency(order.priority_fee)}</span>
              </div>
            </div>

            {order.rider && (
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Rider</p>
                  <p className="text-sm font-semibold">{order.rider.full_name}</p>
                </div>
                <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                  {order.rider.rider_profile?.vehicle_type}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
