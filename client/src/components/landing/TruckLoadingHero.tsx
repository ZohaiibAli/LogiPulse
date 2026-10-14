import { PackageCheck } from "lucide-react"
import TruckScene from "@/components/illustrations/TruckScene"

export default function TruckLoadingHero() {
  return (
    <div className="card-glow relative z-10 rounded-[2rem] border border-white/60 bg-white p-5 dark:border-border dark:bg-card">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <PackageCheck className="h-4 w-4 text-primary" /> Loading your delivery
        </span>
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      </div>

      <div className="relative h-56 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#eef1ff_0%,#f3eeff_100%)] dark:bg-[linear-gradient(135deg,#1b1640_0%,#241c4d_100%)]">
        <span className="absolute left-4 top-4 z-10 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white shadow">
          Packing your order…
        </span>
        <TruckScene className="absolute inset-0 h-full w-full overflow-visible" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[["120", "Deliveries"], ["10", "Riders online"], ["4.9", "Avg. rating"]].map(([num, label]) => (
          <div key={label} className="rounded-xl bg-secondary/60 py-2">
            <p className="text-lg font-extrabold text-foreground">{num}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
