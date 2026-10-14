import type { Order, OrderStatus } from "@/types"
import type { TrendPoint } from "@/components/charts/TrendBarChart"

const DAY_MS = 24 * 60 * 60 * 1000

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** Builds the last `days` day buckets (oldest first, today last), summing `value(order)`
 *  into the bucket matching `dateOf(order)`. Orders with no matching date are ignored. */
export function bucketByDay(
  orders: Order[],
  days: number,
  dateOf: (o: Order) => string | null | undefined,
  value: (o: Order) => number
): TrendPoint[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const buckets = new Map<string, number>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS)
    buckets.set(dayKey(d), 0)
  }

  for (const order of orders) {
    const raw = dateOf(order)
    if (!raw) continue
    const d = new Date(raw)
    d.setHours(0, 0, 0, 0)
    const key = dayKey(d)
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) || 0) + value(order))
    }
  }

  return Array.from(buckets.entries()).map(([key, total]) => {
    const d = new Date(key)
    return {
      label: `${MONTH[d.getMonth()]} ${d.getDate()}`,
      full: `${WEEKDAY[d.getDay()]}, ${MONTH[d.getMonth()]} ${d.getDate()}`,
      value: total,
    }
  })
}

export function countByStatus(orders: Order[]): Record<OrderStatus, number> {
  const counts: Record<string, number> = {}
  for (const o of orders) counts[o.status] = (counts[o.status] || 0) + 1
  return counts as Record<OrderStatus, number>
}
