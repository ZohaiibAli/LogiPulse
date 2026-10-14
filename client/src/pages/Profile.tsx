import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Mail, Phone, ShieldCheck, Star, KeyRound, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { useChangePassword } from "@/hooks/useApi"
import { getErrorMessage } from "@/lib/api"
import { getInitials } from "@/lib/utils"

const schema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

type FormValues = z.infer<typeof schema>

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const changePassword = useChangePassword()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      await changePassword.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      })
      toast.success("Password updated")
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current_password">Current password</Label>
            <Input id="current_password" type="password" {...register("current_password")} />
            {errors.current_password && <p className="text-xs text-destructive">{errors.current_password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password">New password</Label>
            <Input id="new_password" type="password" {...register("new_password")} />
            {errors.new_password && <p className="text-xs text-destructive">{errors.new_password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirm new password</Label>
            <Input id="confirm_password" type="password" {...register("confirm_password")} />
            {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" className="rounded-full bg-brand-gradient" disabled={changePassword.isPending}>
              {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Profile</h1>
        <p className="text-sm text-muted-foreground">Your LogiPulse account details.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-xl font-bold text-white">
              {getInitials(user.full_name)}
            </div>
            <div>
              <p className="text-lg font-bold">{user.full_name}</p>
              <Badge variant="outline" className="mt-1 border-indigo-200 bg-indigo-50 capitalize text-indigo-700">{user.role}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setChangePasswordOpen(true)}>
            <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Change password
          </Button>
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

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </div>
  )
}
