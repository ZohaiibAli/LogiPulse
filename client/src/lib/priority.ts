import type { OrderPriority } from "@/types"

// Mirrors server/core/pricing.py's PRIORITY_FEES — shown while the customer
// is choosing, before the server (the source of truth) confirms it via /orders/estimate.
export const PRIORITY_FEE: Record<OrderPriority, number> = {
  normal: 200,
  high: 300,
  urgent: 500,
}

export const PRIORITY_LABEL: Record<OrderPriority, string> = {
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
}

// Urgent first — for "sort by priority" in the rider feed.
export const PRIORITY_RANK: Record<OrderPriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
}

// Normal stays visually quiet; High/Urgent are the ones the brief calls out
// to "highlight". Paired with the text label everywhere, never color alone.
export const PRIORITY_COLOR: Record<OrderPriority, string> = {
  normal: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/25",
  high: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
  urgent: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30",
}

export const PRIORITY_ORDER: OrderPriority[] = ["normal", "high", "urgent"]
