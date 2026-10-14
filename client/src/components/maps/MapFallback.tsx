import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MapFallback({
  className,
  message,
  height,
}: {
  className?: string
  message?: string
  height?: number
}) {
  return (
    <div
      style={height ? { minHeight: height } : undefined}
      className={cn(
        "relative flex min-h-[220px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-indigo-100 bg-[linear-gradient(135deg,#eef1ff_0%,#f6f3ff_50%,#fdf2ff_100%)] p-6 text-center",
        "dark:border-indigo-500/20 dark:bg-[linear-gradient(135deg,#171233_0%,#1b1530_50%,#1a1230_100%)]",
        className
      )}
    >
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,#a5a2e8_1px,transparent_0)] [background-size:22px_22px] dark:opacity-[0.15]" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg">
        <MapPin className="h-6 w-6" />
      </div>
      <p className="relative max-w-xs text-sm font-medium text-indigo-900/70 dark:text-indigo-200/70">
        {message || "Map preview"}
      </p>
    </div>
  )
}
