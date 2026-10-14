import { toast } from "sonner"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePendingRiders, useSetRiderApproval } from "@/hooks/useApi"
import { getInitials } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api"

export default function AdminRiders() {
  const { data: riders, isLoading } = usePendingRiders()
  const setApproval = useSetRiderApproval()

  const decide = async (userId: number, status: "approved" | "rejected") => {
    try {
      await setApproval.mutateAsync({ userId, status })
      toast.success(status === "approved" ? "Rider approved" : "Rider rejected")
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Rider approvals</h1>
      <p className="mb-6 text-sm text-muted-foreground">Review and approve riders before they can accept deliveries.</p>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : riders && riders.length > 0 ? (
        <div className="space-y-3">
          {riders.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
                  {getInitials(r.full_name)}
                </div>
                <div>
                  <p className="font-semibold">{r.full_name}</p>
                  <p className="text-xs text-muted-foreground">{r.email} · {r.phone || "No phone"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="capitalize">{r.rider_profile?.vehicle_type}</span>
                <span>{r.rider_profile?.vehicle_number || "No plate"}</span>
                <span>CNIC: {r.rider_profile?.cnic || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => decide(r.id, "rejected")}>
                  <X className="mr-1 h-3.5 w-3.5" /> Reject
                </Button>
                <Button size="sm" className="rounded-full bg-brand-gradient" onClick={() => decide(r.id, "approved")}>
                  <Check className="mr-1 h-3.5 w-3.5" /> Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No pending riders.
        </div>
      )}
    </div>
  )
}
