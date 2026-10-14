import { motion } from "framer-motion"
import { Star, Truck, Wallet, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyOrders, useRiderProfile } from "@/hooks/useApi"
import { formatCurrency, formatDate } from "@/lib/utils"
import { bucketByDay } from "@/lib/chartData"
import Sparkline from "@/components/charts/Sparkline"
import TrendBarChart from "@/components/charts/TrendBarChart"

export default function RiderEarnings() {
  const { data: orders, isLoading } = useMyOrders()
  const { data: profile } = useRiderProfile()

  const delivered = orders?.filter((o) => o.status === "delivered") ?? []
  const totalEarnings = delivered.reduce((sum, o) => sum + o.price, 0)

  const earningsByDay = orders
    ? bucketByDay(orders, 14, (o) => (o.status === "delivered" ? o.delivered_at : null), (o) => o.price)
    : []
  const earningsSparkline = earningsByDay.slice(-10).map((d) => d.value)

  const stats = [
    { label: "Total earnings", value: formatCurrency(totalEarnings), icon: Wallet, color: "bg-emerald-50 text-emerald-600", sparkline: earningsSparkline },
    { label: "Deliveries completed", value: profile?.total_deliveries ?? delivered.length, icon: Truck, color: "bg-indigo-50 text-indigo-600" },
    { label: "Rider rating", value: profile?.rating?.toFixed(1) ?? "5.0", icon: Star, color: "bg-amber-50 text-amber-600" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Earnings</h1>
        <p className="text-sm text-muted-foreground">Track your completed deliveries and income.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-5"
          >
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
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="rounded-2xl border bg-card p-5"
      >
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold">Earnings — last 14 days</h2>
        </div>
        {orders ? (
          earningsByDay.some((d) => d.value > 0) ? (
            <TrendBarChart data={earningsByDay} valuePrefix="Rs " height={180} />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">No earnings in this window yet.</p>
          )
        ) : (
          <Skeleton className="h-[180px] w-full" />
        )}
      </motion.div>

      <div>
        <h2 className="mb-4 text-lg font-bold">Completed deliveries</h2>
        {isLoading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : delivered.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Delivered</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3 text-right">Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {delivered.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-medium">#{o.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.delivered_at ? formatDate(o.delivered_at) : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.distance_km} km</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(o.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No completed deliveries yet.
          </div>
        )}
      </div>
    </div>
  )
}
