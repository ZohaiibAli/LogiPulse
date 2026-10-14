import { Link } from "react-router-dom"
import { Users, Bike, Package, Wallet, Activity, CheckCircle2, ArrowRight, TrendingUp, PieChart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useAdminStats, usePendingRiders, useMyOrders } from "@/hooks/useApi"
import { formatCurrency, getInitials } from "@/lib/utils"
import { bucketByDay, countByStatus } from "@/lib/chartData"
import Sparkline from "@/components/charts/Sparkline"
import VehicleTrendChart from "@/components/charts/VehicleTrendChart"
import StatusBreakdownChart from "@/components/charts/StatusBreakdownChart"

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats()
  const { data: pending } = usePendingRiders()
  const { data: orders } = useMyOrders()

  const ordersByDay = orders ? bucketByDay(orders, 14, (o) => o.created_at, () => 1) : []
  const revenueByDay = orders
    ? bucketByDay(orders, 14, (o) => (o.status === "delivered" ? o.delivered_at : null), (o) => o.price)
    : []
  const statusCounts = orders ? countByStatus(orders) : {}

  const ordersSparkline = ordersByDay.slice(-10).map((d) => d.value)
  const revenueSparkline = revenueByDay.slice(-10).map((d) => d.value)

  const cards = [
    { label: "Customers", value: stats?.total_customers, icon: Users, color: "bg-indigo-50 text-indigo-600" },
    { label: "Riders", value: stats?.total_riders, icon: Bike, color: "bg-violet-50 text-violet-600" },
    { label: "Active orders", value: stats?.active_orders, icon: Activity, color: "bg-amber-50 text-amber-600" },
    { label: "Delivered", value: stats?.delivered_orders, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total orders", value: stats?.total_orders, icon: Package, color: "bg-blue-50 text-blue-600", sparkline: ordersSparkline },
    { label: "Revenue", value: stats ? formatCurrency(stats.revenue) : undefined, icon: Wallet, color: "bg-rose-50 text-rose-600", sparkline: revenueSparkline },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Admin overview</h1>
        <p className="text-sm text-muted-foreground">Platform-wide snapshot of LogiPulse.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                {isLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-extrabold">{c.value ?? 0}</p>}
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </div>
            {c.sparkline && c.sparkline.length > 1 && <Sparkline values={c.sparkline} />}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card p-5">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">Orders — last 14 days</h2>
          </div>
          {orders ? (
            ordersByDay.some((d) => d.value > 0) ? (
              <VehicleTrendChart data={ordersByDay} vehicle="radar" height={180} />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">No orders in this window yet.</p>
            )
          ) : (
            <Skeleton className="h-[180px] w-full" />
          )}
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="mb-5 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">Orders by status</h2>
          </div>
          {orders ? <StatusBreakdownChart counts={statusCounts} /> : <Skeleton className="h-[180px] w-full" />}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Pending rider approvals</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/riders" className="flex items-center gap-1 text-sm font-semibold text-primary">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {pending && pending.length > 0 ? (
          <div className="space-y-3">
            {pending.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                  {getInitials(r.full_name)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.full_name}</p>
                  <p className="text-xs text-muted-foreground">{r.email}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Pending</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pending riders right now.</p>
        )}
      </div>
    </div>
  )
}
