import { motion } from "framer-motion"
import { Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import OrderCard from "@/components/orders/OrderCard"
import { useMyOrders } from "@/hooks/useApi"

export default function RiderOrders() {
  const { data: orders, isLoading } = useMyOrders()

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Delivery history</h1>
      <p className="mb-6 text-sm text-muted-foreground">Every delivery you've accepted.</p>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04 }}
            >
              <OrderCard order={o} to={`/rider/orders/${o.id}`} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <Package className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">No deliveries yet</p>
          <p className="text-sm text-muted-foreground">Accept a request from the dashboard to get started.</p>
        </div>
      )}
    </div>
  )
}
