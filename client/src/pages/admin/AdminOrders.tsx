import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyOrders } from "@/hooks/useApi"
import { cn, formatCurrency, formatDate, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/utils"

export default function AdminOrders() {
  const { data: orders, isLoading } = useMyOrders()

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">All orders</h1>
      <p className="mb-6 text-sm text-muted-foreground">Every booking across the platform.</p>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Placed</th>
                <th className="px-4 py-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders?.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${o.id}`} className="font-semibold text-primary hover:underline">#{o.id}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.customer.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.rider?.full_name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("border", ORDER_STATUS_COLOR[o.status])}>
                      {ORDER_STATUS_LABEL[o.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(o.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders && orders.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">No orders yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
