import { Link } from "react-router-dom"
import { Users, Bike, Package, Wallet, Activity, CheckCircle2, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useAdminStats, usePendingRiders } from "@/hooks/useApi"
import { formatCurrency, getInitials } from "@/lib/utils"

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats()
  const { data: pending } = usePendingRiders()

  const cards = [
    { label: "Customers", value: stats?.total_customers, icon: Users, color: "bg-indigo-50 text-indigo-600" },
    { label: "Riders", value: stats?.total_riders, icon: Bike, color: "bg-violet-50 text-violet-600" },
    { label: "Active orders", value: stats?.active_orders, icon: Activity, color: "bg-amber-50 text-amber-600" },
    { label: "Delivered", value: stats?.delivered_orders, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total orders", value: stats?.total_orders, icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Revenue", value: stats ? formatCurrency(stats.revenue) : undefined, icon: Wallet, color: "bg-rose-50 text-rose-600" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Admin overview</h1>
        <p className="text-sm text-muted-foreground">Platform-wide snapshot of LogiPulse.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="flex items-center gap-4 rounded-2xl border bg-card p-5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </span>
            <div>
              {isLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-extrabold">{c.value ?? 0}</p>}
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </div>
        ))}
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
