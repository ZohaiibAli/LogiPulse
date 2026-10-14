import { Mail, Phone, ShieldCheck, Star, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { getInitials } from "@/lib/utils"

export default function Profile() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Profile</h1>
        <p className="text-sm text-muted-foreground">Your LogiPulse account details.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-xl font-bold text-white">
            {getInitials(user.full_name)}
          </div>
          <div>
            <p className="text-lg font-bold">{user.full_name}</p>
            <Badge variant="outline" className="mt-1 border-indigo-200 bg-indigo-50 capitalize text-indigo-700">{user.role}</Badge>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" /> {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" /> {user.phone}
            </div>
          )}
          <div className="flex items-center gap-3">
            <UserIcon className="h-4 w-4 text-muted-foreground" /> Member since {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>

        {user.rider_profile && (
          <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Vehicle</p>
              <p className="font-semibold capitalize">{user.rider_profile.vehicle_type} · {user.rider_profile.vehicle_number || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approval status</p>
              <p className="flex items-center gap-1 font-semibold capitalize">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> {user.rider_profile.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rating</p>
              <p className="flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {user.rider_profile.rating.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total deliveries</p>
              <p className="font-semibold">{user.rider_profile.total_deliveries}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
