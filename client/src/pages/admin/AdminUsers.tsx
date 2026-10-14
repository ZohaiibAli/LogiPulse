import { useState } from "react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminUsers, useSetUserActive } from "@/hooks/useApi"
import { formatDate, getInitials } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api"
import type { UserRole } from "@/types"

const TABS: { label: string; role?: UserRole }[] = [
  { label: "All" },
  { label: "Customers", role: "customer" },
  { label: "Riders", role: "rider" },
  { label: "Admins", role: "admin" },
]

export default function AdminUsers() {
  const [tab, setTab] = useState("All")
  const role = TABS.find((t) => t.label === tab)?.role
  const { data: users, isLoading } = useAdminUsers(role)
  const setActive = useSetUserActive()

  const toggle = async (userId: number, isActive: boolean) => {
    try {
      await setActive.mutateAsync({ userId, isActive })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Users</h1>
      <p className="mb-6 text-sm text-muted-foreground">Manage customers, riders, and admins.</p>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="bg-secondary">
          {TABS.map((t) => <TabsTrigger key={t.label} value={t.label}>{t.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users?.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-semibold text-white">
                        {getInitials(u.full_name)}
                      </div>
                      <div>
                        <p className="font-medium">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{u.role}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Switch
                      checked={u.is_active}
                      disabled={u.role === "admin"}
                      onCheckedChange={(checked) => toggle(u.id, checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users && users.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">No users found.</p>
          )}
        </div>
      )}
    </div>
  )
}
