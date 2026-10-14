import { Link } from "react-router-dom"
import { Package, Truck, CheckCircle2, Plus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useMyOrders } from "@/hooks/useApi"
import OrderCard from "@/components/orders/OrderCard"
import { Skeleton } from "@/components/ui/skeleton"

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { data: orders, isLoading } = useMyOrders()

  const active = orders?.filter((o) => !["delivered", "cancelled"].includes(o.status)).length ?? 0
  const delivered = orders?.filter((o) => o.status === "delivered").length ?? 0
  const total = orders?.length ?? 0

  const stats = [
    { label: "Active orders", value: active, icon: Truck, color: "bg-indigo-50 text-indigo-600" },
    { label: "Delivered", value: delivered, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total bookings", value: total, icon: Package, color: "bg-violet-50 text-violet-600" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Hi, {user?.full_name.split(" ")[0]} 👋</h1>
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
          <div key={s.label} className="flex items-center gap-4 rounded-2xl border bg-card p-5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

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
