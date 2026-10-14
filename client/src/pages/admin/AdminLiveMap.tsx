import { Bike, Circle } from "lucide-react"
import FleetMap from "@/components/maps/FleetMap"
import { useOnlineRiders } from "@/hooks/useApi"
import { getInitials } from "@/lib/utils"

export default function AdminLiveMap() {
  const { data: riders, isLoading } = useOnlineRiders()

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Live fleet map</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Real-time positions of every online, approved rider.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <FleetMap riders={riders ?? []} />

        <div className="space-y-3">
          <div className="flex items-center gap-4 rounded-xl border bg-card p-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" /> Waiting</span>
            <span className="flex items-center gap-1.5"><Circle className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> On delivery</span>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Bike className="h-4 w-4 text-primary" /> Online riders ({riders?.length ?? 0})
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : riders && riders.length > 0 ? (
              <ul className="space-y-3">
                {riders.map((r) => (
                  <li key={r.user_id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                      {getInitials(r.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.full_name}</p>
                      <p className="truncate text-xs capitalize text-muted-foreground">{r.vehicle_type} · ★ {r.rating.toFixed(1)}</p>
                    </div>
                    {r.active_order_id ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">#{r.active_order_id}</span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Free</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No riders online right now.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
