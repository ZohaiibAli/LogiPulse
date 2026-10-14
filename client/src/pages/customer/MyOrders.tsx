import { useState } from "react"
import { Package } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import OrderCard from "@/components/orders/OrderCard"
import { useMyOrders } from "@/hooks/useApi"
import type { OrderStatus } from "@/types"

const FILTERS: { label: string; statuses?: OrderStatus[] }[] = [
  { label: "All" },
  { label: "Active", statuses: ["pending", "accepted", "picked_up", "in_transit"] },
  { label: "Delivered", statuses: ["delivered"] },
  { label: "Cancelled", statuses: ["cancelled"] },
]

export default function MyOrders() {
  const { data: orders, isLoading } = useMyOrders()
  const [filter, setFilter] = useState("All")

  const active = FILTERS.find((f) => f.label === filter)
  const filtered = orders?.filter((o) => !active?.statuses || active.statuses.includes(o.status))

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">My orders</h1>
      <p className="mb-6 text-sm text-muted-foreground">Everything you've booked, in one place.</p>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-secondary">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.label} value={f.label}>{f.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o} to={`/app/orders/${o.id}`} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <Package className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">No orders here</p>
        </div>
      )}
    </div>
  )
}
