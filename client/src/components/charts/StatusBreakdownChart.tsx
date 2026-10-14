import { useState } from "react"
import { STATUS_ORDER, statusColor } from "@/lib/chartColors"
import { useTheme } from "@/contexts/ThemeContext"
import { ORDER_STATUS_LABEL } from "@/lib/utils"
import type { OrderStatus } from "@/types"

interface Props {
  counts: Record<string, number>
}

// Horizontal bars — the right form for 6 longer-named categories (per the
// dataviz skill's form table: "part-to-whole... go horizontal for many /
// long-named categories"). Colors are a validated, FIXED sequence — see
// lib/chartColors.ts — so STATUS_ORDER must stay in this exact order.
export default function StatusBreakdownChart({ counts }: Props) {
  const { theme } = useTheme()
  const [hover, setHover] = useState<OrderStatus | null>(null)
  const max = Math.max(...STATUS_ORDER.map((s) => counts[s] || 0), 1)

  return (
    <div className="space-y-3">
      {STATUS_ORDER.map((status) => {
        const value = counts[status] || 0
        const pct = (value / max) * 100
        const color = statusColor(status, theme)
        const isHover = hover === status
        return (
          <div
            key={status}
            className="group"
            onPointerEnter={() => setHover(status)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(status)}
            onBlur={() => setHover(null)}
            tabIndex={0}
          >
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{ORDER_STATUS_LABEL[status]}</span>
              <span className="font-semibold text-foreground">{value}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width,opacity] duration-300"
                style={{
                  width: `${value > 0 ? Math.max(pct, 3) : 0}%`,
                  background: color,
                  opacity: hover === null || isHover ? 1 : 0.5,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
