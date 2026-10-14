import { Link } from "react-router-dom"
import { MapPin, Package, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, cn } from "@/lib/utils"
import type { Order } from "@/types"

export default function OrderCard({ order, to }: { order: Order; to: string }) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-indigo-500/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Package className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Order #{order.id}</p>
            <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("shrink-0 border", ORDER_STATUS_COLOR[order.status])}>
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
          <span className="line-clamp-1 text-muted-foreground">{order.pickup_address}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
          <span className="line-clamp-1 text-muted-foreground">{order.dropoff_address}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <span className="font-bold">{formatCurrency(order.price)}</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View details <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}
