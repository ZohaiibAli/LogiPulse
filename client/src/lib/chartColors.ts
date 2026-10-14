// Categorical palette for the 6 order statuses, in a FIXED render order.
// This exact sequence was validated with the dataviz skill's CVD checker
// (validate_palette.js) — both light and dark pass every check, with the
// 6-8 ΔE band and the sub-3:1 contrast WARN mitigated by the direct value
// labels every bar carries. Never reorder these relative to each other —
// the ordering itself is the CVD-safety mechanism, not cosmetic.
import type { OrderStatus } from "@/types"

export const STATUS_ORDER: OrderStatus[] = [
  "pending", "accepted", "picked_up", "in_transit", "delivered", "cancelled",
]

export const STATUS_CHART_COLOR: Record<OrderStatus, { light: string; dark: string }> = {
  pending: { light: "#2a78d6", dark: "#3987e5" },
  accepted: { light: "#eb6834", dark: "#d95926" },
  picked_up: { light: "#1baf7a", dark: "#199e70" },
  in_transit: { light: "#eda100", dark: "#c98500" },
  delivered: { light: "#008300", dark: "#008300" },
  cancelled: { light: "#e34948", dark: "#e66767" },
}

export function statusColor(status: OrderStatus, theme: "light" | "dark"): string {
  return STATUS_CHART_COLOR[status][theme]
}

// Single sequential brand hue for magnitude/trend charts (orders/day,
// earnings/day) — reuses the app's own indigo primary via CSS vars so it
// always matches the theme automatically, light or dark.
export const TREND_FILL = "hsl(var(--primary))"
export const TREND_FILL_WASH = "hsl(var(--primary) / 0.12)"
