import { Check } from "lucide-react"
import { cn, formatDate, ORDER_STATUS_LABEL } from "@/lib/utils"
import type { OrderStatus, StatusHistoryItem } from "@/types"

const FLOW: OrderStatus[] = ["pending", "accepted", "picked_up", "in_transit", "delivered"]

export default function StatusTimeline({ history, currentStatus }: { history: StatusHistoryItem[]; currentStatus: OrderStatus }) {
  if (currentStatus === "cancelled") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
        This order was cancelled.
      </div>
    )
  }

  const reachedIndex = FLOW.indexOf(currentStatus)
  const historyMap = new Map(history.map((h) => [h.status, h.created_at]))

  return (
    <ol className="relative ml-3 space-y-6 border-l-2 border-dashed border-indigo-100">
      {FLOW.map((status, i) => {
        const done = i <= reachedIndex
        const timestamp = historyMap.get(status)
        return (
          <li key={status} className="relative pl-6">
            <span
              className={cn(
                "absolute -left-[11px] top-0 flex h-5 w-5 items-center justify-center rounded-full border-2",
                done ? "border-indigo-600 bg-brand-gradient text-white" : "border-muted bg-card"
              )}
            >
              {done && <Check className="h-3 w-3" />}
            </span>
            <p className={cn("text-sm font-semibold", done ? "text-foreground" : "text-muted-foreground")}>
              {ORDER_STATUS_LABEL[status]}
            </p>
            {timestamp && <p className="text-xs text-muted-foreground">{formatDate(timestamp)}</p>}
          </li>
        )
      })}
    </ol>
  )
}
