import { Link } from "react-router-dom"
import { Package, Truck, CheckCircle2, Plus, ArrowRight, TrendingUp, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useMyOrders } from "@/hooks/useApi"
import OrderCard from "@/components/orders/OrderCard"
import { Skeleton } from "@/components/ui/skeleton"
import { bucketByDay, countByStatus } from "@/lib/chartData"
import Sparkline from "@/components/charts/Sparkline"
import VehicleTrendChart from "@/components/charts/VehicleTrendChart"
import StatusBreakdownChart from "@/components/charts/StatusBreakdownChart"
import RateDeliveryCard from "@/components/orders/RateDeliveryCard"

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { data: orders, isLoading } = useMyOrders()

  const active = orders?.filter((o) => !["delivered", "cancelled"].includes(o.status)).length ?? 0
  const delivered = orders?.filter((o) => o.status === "delivered").length ?? 0
  const total = orders?.length ?? 0

  const bookingsByDay = orders ? bucketByDay(orders, 14, (o) => o.created_at, () => 1) : []
  const spendByDay = orders ? bucketByDay(orders, 14, (o) => o.created_at, (o) => o.price) : []
  const bookingsSparkline = bookingsByDay.slice(-10).map((d) => d.value)
  const statusCounts = orders ? countByStatus(orders) : {}
  const hasOrders = (orders?.length ?? 0) > 0
  const unratedDelivered = orders?.filter((o) => o.status === "delivered" && o.rating == null) ?? []

  const stats = [
    { label: "Active orders", value: active, icon: Truck, color: "bg-indigo-50 text-indigo-600" },
    { label: "Delivered", value: delivered, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total bookings", value: total, icon: Package, color: "bg-violet-50 text-violet-600", sparkline: bookingsSparkline },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Hi, {user?.full_name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground">Here's what's happening with your deliveries.</p>
        </div>
        <Button asChild className="rounded-full bg-brand-gradient shadow-md shadow-indigo-500/30">
          <Link to="/app/book">
            <Plus className="mr-1.5 h-4 w-4" /> Book a courier
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                {isLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-extrabold">{s.value}</p>}
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
            {s.sparkline && s.sparkline.length > 1 && <Sparkline values={s.sparkline} />}
          </div>
        ))}
      </div>

      {unratedDelivered.length > 0 && (
        <div className="space-y-4">
          {unratedDelivered.slice(0, 2).map((o) => (
            <RateDeliveryCard key={o.id} order={o} />
          ))}
        </div>
      )}

      {hasOrders && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Spending — last 14 days</h2>
            </div>
            <VehicleTrendChart data={spendByDay} vehicle="truck" valuePrefix="Rs " height={160} />
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-5 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Orders by status</h2>
            </div>
            <StatusBreakdownChart counts={statusCounts} />
          </div>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent orders</h2>
          <Link to="/app/orders" className="flex items-center gap-1 text-sm font-semibold text-primary">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.slice(0, 6).map((o) => (
              <OrderCard key={o.id} order={o} to={`/app/orders/${o.id}`} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-semibold">No orders yet</p>
            <p className="text-sm text-muted-foreground">Book your first courier to see it here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
